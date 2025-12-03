import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post from '@/models/Post'

// GET /api/posts/batch-stats?ids=id1,id2,id3
// Get stats for multiple posts in a single request
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const idsParam = searchParams.get('ids')

        if (!idsParam) {
            return NextResponse.json(
                { error: 'Missing ids parameter' },
                { status: 400 }
            )
        }

        const ids = idsParam.split(',').slice(0, 50) // Limit to 50 posts

        await dbConnect()

        // Fetch all posts in one query
        const posts = await Post.find({ _id: { $in: ids } })
            .select('_id likes comments')
            .lean()

        // Build stats object
        const stats = {}
        posts.forEach(post => {
            const approvedComments = post.comments?.filter(c => c.isApproved) || []
            stats[post._id.toString()] = {
                likes: post.likes?.length || 0,
                comments: approvedComments.length
            }
        })

        return NextResponse.json({ stats }, {
            headers: {
                // Cache for 1 minute, serve stale for 2 minutes
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        })
    } catch (error) {
        console.error('Error fetching batch stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
