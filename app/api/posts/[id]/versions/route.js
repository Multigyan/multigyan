import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import PostVersion from '@/models/PostVersion'

/**
 * Version History API
 * 
 * GET /api/posts/[id]/versions - Get version history
 * POST /api/posts/[id]/versions/restore - Restore a version
 */

// GET - Get version history for a post
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit')) || 20
        const skip = parseInt(searchParams.get('skip')) || 0

        await connectDB()

        // Verify post exists and user has access
        const post = await Post.findById(id).lean()

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Check if user is author, co-author, or admin
        const isAuthor = post.author.toString() === session.user.id
        const isCoAuthor = post.coAuthors?.some(id => id.toString() === session.user.id)
        const isAdmin = session.user.role === 'admin'

        if (!isAuthor && !isCoAuthor && !isAdmin) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Get version history
        const versions = await PostVersion.getHistory(id, limit, skip)

        // Get total count
        const total = await PostVersion.countDocuments({ post: id })

        return NextResponse.json({
            versions,
            total,
            hasMore: skip + versions.length < total
        })

    } catch (error) {
        console.error('Version history error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch version history', details: error.message },
            { status: 500 }
        )
    }
}

// POST - Restore a version
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params
        const { version, reason } = await request.json()

        if (!version) {
            return NextResponse.json(
                { error: 'Version number is required' },
                { status: 400 }
            )
        }

        await connectDB()

        // Verify post exists and user has access
        const post = await Post.findById(id)

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Check if user is author, co-author, or admin
        const isAuthor = post.author.toString() === session.user.id
        const isCoAuthor = post.coAuthors?.some(id => id.toString() === session.user.id)
        const isAdmin = session.user.role === 'admin'

        if (!isAuthor && !isCoAuthor && !isAdmin) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Get version snapshot
        const snapshot = await PostVersion.restoreVersion(id, version)

        // Create a new version of current state before restoring
        await PostVersion.createVersion(
            post,
            session.user.id,
            `Before restoring to version ${version}`
        )

        // Restore the snapshot
        Object.assign(post, snapshot)
        post.lastEditedBy = session.user.id
        post.lastEditedAt = new Date()
        post.editReason = reason || `Restored to version ${version}`

        await post.save()

        // Create version of restored state
        await PostVersion.createVersion(
            post,
            session.user.id,
            `Restored to version ${version}${reason ? `: ${reason}` : ''}`
        )

        return NextResponse.json({
            message: 'Version restored successfully',
            post: await Post.findById(id)
                .populate('author', 'name email profilePictureUrl')
                .populate('coAuthors', 'name email profilePictureUrl')
                .populate('category', 'name slug')
                .lean()
        })

    } catch (error) {
        console.error('Version restore error:', error)
        return NextResponse.json(
            { error: 'Failed to restore version', details: error.message },
            { status: 500 }
        )
    }
}
