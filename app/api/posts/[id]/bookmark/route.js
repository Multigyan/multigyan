import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

/**
 * POST /api/posts/[id]/bookmark
 * Toggle bookmark (save/unsave) a post
 */
export async function POST(request, { params }) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to bookmark posts' },
        { status: 401 }
      )
    }

    await connectDB()

    const post = await Post.findById(resolvedParams.id)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if post is published
    if (post.status !== 'published') {
      return NextResponse.json(
        { error: 'Can only bookmark published posts' },
        { status: 400 }
      )
    }

    // Check if already bookmarked
    const isBookmarked = post.saves.includes(session.user.id)
    
    if (isBookmarked) {
      // Remove bookmark
      await post.removeSave(session.user.id)
      return NextResponse.json({
        success: true,
        message: 'Bookmark removed',
        isBookmarked: false,
        saveCount: post.saves.length
      })
    } else {
      // Add bookmark
      await post.addSave(session.user.id)
      return NextResponse.json({
        success: true,
        message: 'Post bookmarked successfully',
        isBookmarked: true,
        saveCount: post.saves.length
      })
    }

  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to bookmark post' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/posts/[id]/bookmark
 * Check if current user has bookmarked this post
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({
        success: true,
        isBookmarked: false
      })
    }

    await connectDB()

    const post = await Post.findById(resolvedParams.id).select('saves')
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const isBookmarked = post.saves.includes(session.user.id)

    return NextResponse.json({
      success: true,
      isBookmarked,
      saveCount: post.saves.length
    })

  } catch (error) {
    console.error('Error checking bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to check bookmark status' },
      { status: 500 }
    )
  }
}
