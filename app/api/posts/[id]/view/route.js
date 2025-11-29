import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

/**
 * POST /api/posts/[id]/view
 * 
 * Increment view count for a post
 * This endpoint is called client-side to track views for all users
 */
export async function POST(request, { params }) {
    try {
        const resolvedParams = await params
        const postId = resolvedParams.id

        console.log('[View API] Received request for post:', postId)

        await connectDB()

        // Get session to check if user is the author
        const session = await getServerSession(authOptions)

        // Find the post
        const post = await Post.findById(postId).select('author status').lean()

        if (!post) {
            console.log('[View API] Post not found:', postId)
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Only count views for published posts
        if (post.status !== 'published') {
            console.log('[View API] Post not published:', postId, post.status)
            return NextResponse.json({ success: true, counted: false, reason: 'not_published' })
        }

        // Don't count views if the user is the author
        if (session && session.user.id === post.author.toString()) {
            console.log('[View API] User is author, not counting:', session.user.id)
            return NextResponse.json({ success: true, counted: false, reason: 'is_author' })
        }

        // Increment view count
        await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } })

        console.log('[View API] ✅ View counted for post:', postId)
        return NextResponse.json({ success: true, counted: true })

    } catch (error) {
        console.error('[View API] Error tracking view:', error)
        // Return success even on error to not break the page
        return NextResponse.json({ success: true, counted: false, error: error.message })
    }
}
