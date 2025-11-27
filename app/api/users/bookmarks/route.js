import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import logger from '@/lib/logger'

/**
 * GET /api/users/bookmarks
 * Get all bookmarked posts for the current user
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to view bookmarks' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 12
    const skip = (page - 1) * limit

    await connectDB()

    // Find all posts where the current user is in the saves array
    const posts = await Post.find({
      status: 'published',
      saves: session.user.id
    })
      .populate('author', 'name profilePictureUrl')
      .populate('category', 'name slug color')
      .select('title slug excerpt featuredImageUrl readingTime publishedAt likes saves views averageRating difficulty cuisine prepTime cookTime estimatedTime')
      .sort({ createdAt: -1 }) // Most recently bookmarked first
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await Post.countDocuments({
      status: 'published',
      saves: session.user.id
    })

    return NextResponse.json({
      success: true,
      posts: posts.map(post => ({
        ...post,
        likeCount: post.likes?.length || 0,
        saveCount: post.saves?.length || 0
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logger.error('Error fetching bookmarks:', { error })
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}
