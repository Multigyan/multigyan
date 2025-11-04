import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

/**
 * GET /api/posts/[id]/ratings
 * Get all ratings for a post
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    
    await connectDB()

    const post = await Post.findById(resolvedParams.id)
      .populate('ratings.user', 'name profilePictureUrl')
      .select('ratings averageRating')
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Sort ratings by most helpful first, then newest
    const sortedRatings = post.ratings
      .map(rating => ({
        id: rating._id,
        user: rating.user,
        rating: rating.rating,
        review: rating.review,
        helpfulCount: rating.helpful.length,
        createdAt: rating.createdAt
      }))
      .sort((a, b) => {
        // First sort by helpful count
        if (b.helpfulCount !== a.helpfulCount) {
          return b.helpfulCount - a.helpfulCount
        }
        // Then by date
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

    return NextResponse.json({
      success: true,
      ratings: sortedRatings,
      averageRating: post.averageRating,
      totalRatings: post.ratings.length
    })

  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts/[id]/ratings
 * Add or update a rating for a post
 */
export async function POST(request, { params }) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to rate posts' },
        { status: 401 }
      )
    }

    const { rating, review } = await request.json()

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
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
        { error: 'Can only rate published posts' },
        { status: 400 }
      )
    }

    // Add or update rating
    await post.addRating(session.user.id, rating, review || '')

    return NextResponse.json({
      success: true,
      message: 'Rating saved successfully',
      averageRating: post.averageRating,
      totalRatings: post.ratings.length
    })

  } catch (error) {
    console.error('Error saving rating:', error)
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/posts/[id]/ratings
 * Mark a rating as helpful
 */
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in' },
        { status: 401 }
      )
    }

    const { ratingId } = await request.json()

    if (!ratingId) {
      return NextResponse.json(
        { error: 'Rating ID is required' },
        { status: 400 }
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

    await post.markRatingHelpful(ratingId, session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Marked as helpful'
    })

  } catch (error) {
    console.error('Error marking rating helpful:', error)
    return NextResponse.json(
      { error: 'Failed to update rating' },
      { status: 500 }
    )
  }
}
