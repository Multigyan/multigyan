import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

// GET posts pending review (Admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const skip = (page - 1) * limit

    // Get posts pending review
    const posts = await Post.find({ status: 'pending_review' })
      .populate('author', 'name email profilePictureUrl')
      .populate('category', 'name slug color')
      .select('title slug excerpt author category createdAt updatedAt readingTime')
      .sort({ createdAt: 1 }) // Oldest first for review queue
      .skip(skip)
      .limit(limit)

    // Get total count
    const total = await Post.countDocuments({ status: 'pending_review' })

    return NextResponse.json({
      posts,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching pending posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}