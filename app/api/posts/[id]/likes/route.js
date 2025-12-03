import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post from '@/models/Post'

// GET /api/posts/[id]/likes - Get real-time likes data
export async function GET(request, { params }) {
    try {
        await dbConnect()

        const post = await Post.findById(params.id)
            .select('likes')
            .lean()

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            likes: post.likes || [],
            count: post.likes?.length || 0
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
            }
        })
    } catch (error) {
        console.error('Error fetching likes:', error)
        return NextResponse.json(
            { error: 'Failed to fetch likes' },
            { status: 500 }
        )
    }
}
