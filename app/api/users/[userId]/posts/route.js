import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'

export async function GET(request, { params }) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = parseInt(searchParams.get('skip') || '0')

    await connectDB()

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get posts by this user
    const posts = await Post.find({
      author: userId,
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('author', 'name username profilePictureUrl')
      .populate('category', 'name slug')
      .select('title slug excerpt featuredImage publishedAt readTime views likes category')

    // Get total count
    const totalPosts = await Post.countDocuments({
      author: userId,
      status: 'published'
    })

    return NextResponse.json({
      success: true,
      posts,
      total: totalPosts,
      hasMore: skip + posts.length < totalPosts
    })

  } catch (error) {
    console.error('Get user posts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
