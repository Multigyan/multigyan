import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post from '@/models/Post'

// GET /api/posts/[id]/comments/count - Get real-time comment count
export async function GET(request, { params }) {
    try {
        await dbConnect()

        const post = await Post.findById(params.id)
            .select('comments')
            .lean()

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Count only approved comments
        const approvedComments = post.comments?.filter(c => c.isApproved) || []

        return NextResponse.json({
            count: approvedComments.length
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
            }
        })
    } catch (error) {
        console.error('Error fetching comment count:', error)
        return NextResponse.json(
            { error: 'Failed to fetch comment count' },
            { status: 500 }
        )
    }
}
