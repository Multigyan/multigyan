import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import PostAnalytics from '@/models/PostAnalytics'

/**
 * Analytics API
 * 
 * GET /api/posts/[id]/analytics - Get analytics for a post
 * POST /api/posts/[id]/analytics/view - Record a view
 */

// GET - Get analytics for a post
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
        const days = parseInt(searchParams.get('days')) || 30

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

        // Get analytics summary
        const summary = await PostAnalytics.getSummary(id, days)

        return NextResponse.json({
            analytics: summary,
            post: {
                title: post.title,
                slug: post.slug,
                publishedAt: post.publishedAt
            }
        })

    } catch (error) {
        console.error('Get analytics error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch analytics', details: error.message },
            { status: 500 }
        )
    }
}

// POST - Record a view
export async function POST(request, { params }) {
    try {
        const { id } = params
        const { isUnique, source, device, readTime } = await request.json()

        await connectDB()

        // Verify post exists
        const post = await Post.findById(id)

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Record view in analytics
        await PostAnalytics.recordView(id, {
            isUnique,
            source,
            device,
            readTime
        })

        // Also update post's total views count
        post.views = (post.views || 0) + 1
        await post.save()

        return NextResponse.json({
            message: 'View recorded'
        })

    } catch (error) {
        console.error('Record view error:', error)
        return NextResponse.json(
            { error: 'Failed to record view', details: error.message },
            { status: 500 }
        )
    }
}
