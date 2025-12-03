import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post from '@/models/Post'

// GET /api/posts/[id]/stats - Get real-time post statistics
export async function GET(request, { params }) {
    try {
        await dbConnect()

        const post = await Post.findById(params.id)
            .select('likes comments')
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
            likes: post.likes?.length || 0,
            comments: approvedComments.length
        }, {
            headers: {
                // Cache for 30 seconds, serve stale for 60s while revalidating
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
            }
        })
    } catch (error) {
        console.error('Error fetching post stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
