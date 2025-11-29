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

        await connectDB()

        // Get session to check if user is the author
        const session = await getServerSession(authOptions)

        // Find the post
        const post = await Post.findById(postId).select('author status').lean()

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Only count views for published posts
        if (post.status !== 'published') {
            return NextResponse.json({ success: true, counted: false })
        }

        // Don't count views if the user is the author
        if (session && session.user.id === post.author.toString()) {
            return NextResponse.json({ success: true, counted: false })
        }

        // Increment view count
        await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } })

        return NextResponse.json({ success: true, counted: true })

    } catch (error) {
        console.error('Error tracking view:', error)
        // Return success even on error to not break the page
        return NextResponse.json({ success: true, counted: false })
    }
}
