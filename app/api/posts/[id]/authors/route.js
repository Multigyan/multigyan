import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

/**
 * Co-Authors Management API
 * 
 * POST /api/posts/[id]/authors - Add co-author
 * DELETE /api/posts/[id]/authors - Remove co-author
 */

// POST - Add co-author
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
        const { userId, role = 'contributor' } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        await connectDB()

        const post = await Post.findById(id)

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Only author or admin can add co-authors
        const isAuthor = post.author.toString() === session.user.id
        const isAdmin = session.user.role === 'admin'

        if (!isAuthor && !isAdmin) {
            return NextResponse.json(
                { error: 'Only the author or admin can add co-authors' },
                { status: 403 }
            )
        }

        // Check if already a co-author
        if (post.coAuthors?.some(id => id.toString() === userId)) {
            return NextResponse.json(
                { error: 'User is already a co-author' },
                { status: 400 }
            )
        }

        // Add as co-author
        if (!post.coAuthors) post.coAuthors = []
        post.coAuthors.push(userId)

        // Also add to contributors if not already there
        const existingContributor = post.contributors?.find(c => c.user.toString() === userId)
        if (!existingContributor) {
            if (!post.contributors) post.contributors = []
            post.contributors.push({
                user: userId,
                role,
                addedBy: session.user.id,
                addedAt: new Date()
            })
        }

        await post.save()

        return NextResponse.json({
            message: 'Co-author added successfully',
            post: await Post.findById(id)
                .populate('author', 'name email profilePictureUrl')
                .populate('coAuthors', 'name email profilePictureUrl')
                .populate('contributors.user', 'name email profilePictureUrl')
                .lean()
        })

    } catch (error) {
        console.error('Add co-author error:', error)
        return NextResponse.json(
            { error: 'Failed to add co-author', details: error.message },
            { status: 500 }
        )
    }
}

// DELETE - Remove co-author
export async function DELETE(request, { params }) {
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
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        await connectDB()

        const post = await Post.findById(id)

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Only author or admin can remove co-authors
        const isAuthor = post.author.toString() === session.user.id
        const isAdmin = session.user.role === 'admin'

        if (!isAuthor && !isAdmin) {
            return NextResponse.json(
                { error: 'Only the author or admin can remove co-authors' },
                { status: 403 }
            )
        }

        // Remove from co-authors
        post.coAuthors = post.coAuthors?.filter(id => id.toString() !== userId) || []

        await post.save()

        return NextResponse.json({
            message: 'Co-author removed successfully',
            post: await Post.findById(id)
                .populate('author', 'name email profilePictureUrl')
                .populate('coAuthors', 'name email profilePictureUrl')
                .lean()
        })

    } catch (error) {
        console.error('Remove co-author error:', error)
        return NextResponse.json(
            { error: 'Failed to remove co-author', details: error.message },
            { status: 500 }
        )
    }
}
