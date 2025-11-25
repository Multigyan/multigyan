import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import { clearStatsCache } from '@/lib/stats'

// Reassign posts from one author to another
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { fromAuthorId, toAuthorId, postIds } = await request.json()

        // Validation
        if (!fromAuthorId || !toAuthorId) {
            return NextResponse.json(
                { error: 'Both fromAuthorId and toAuthorId are required' },
                { status: 400 }
            )
        }

        if (fromAuthorId === toAuthorId) {
            return NextResponse.json(
                { error: 'Cannot reassign posts to the same author' },
                { status: 400 }
            )
        }

        await connectDB()

        // Verify both authors exist
        const [fromAuthor, toAuthor] = await Promise.all([
            User.findById(fromAuthorId),
            User.findById(toAuthorId)
        ])

        if (!fromAuthor || !toAuthor) {
            return NextResponse.json(
                { error: 'One or both authors not found' },
                { status: 404 }
            )
        }

        // Build query
        const query = { author: fromAuthorId }

        // If specific post IDs provided, only reassign those
        if (postIds && postIds.length > 0) {
            query._id = { $in: postIds }
        }

        // Reassign posts
        const result = await Post.updateMany(
            query,
            { $set: { author: toAuthorId } }
        )

        // Clear stats cache
        clearStatsCache()

        return NextResponse.json({
            success: true,
            message: `Successfully reassigned ${result.modifiedCount} post(s)`,
            postsReassigned: result.modifiedCount,
            from: fromAuthor.name,
            to: toAuthor.name
        })

    } catch (error) {
        console.error('Error reassigning posts:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to reassign posts' },
            { status: 500 }
        )
    }
}
