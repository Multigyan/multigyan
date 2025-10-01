import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import mongoose from 'mongoose'

// Helper function to check if string is a valid MongoDB ObjectId
function isValidObjectId(str) {
  return mongoose.Types.ObjectId.isValid(str) && /^[0-9a-fA-F]{24}$/.test(str)
}

export async function GET(request, context) {
  try {
    await connectDB()

    // Next.js 15: await params before accessing properties
    const params = await context.params
    const { identifier } = params
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 12
    const search = searchParams.get('search') || ''

    // Determine if identifier is an ID or username
    let user
    if (isValidObjectId(identifier)) {
      // It's a MongoDB ObjectId
      user = await User.findById(identifier).select('-password').lean()
    } else {
      // It's a username
      user = await User.findOne({ 
        username: identifier.toLowerCase() 
      }).select('-password').lean()
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      )
    }

    // Build query for posts
    const postsQuery = {
      author: user._id,
      status: 'published'
    }

    // Add search if provided
    if (search) {
      postsQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }

    // Get total count for pagination
    const total = await Post.countDocuments(postsQuery)

    // Fetch posts with pagination
    const posts = await Post.find(postsQuery)
      .populate('category', 'name slug color')
      .select('title slug excerpt featuredImage publishedAt readTime views likes category')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Calculate stats
    const allAuthorPosts = await Post.find({ 
      author: user._id, 
      status: 'published' 
    }).select('views likes').lean()

    const stats = {
      totalPosts: allAuthorPosts.length,
      totalViews: allAuthorPosts.reduce((sum, post) => sum + (post.views || 0), 0),
      totalLikes: allAuthorPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)
    }

    // Calculate pagination
    const pages = Math.ceil(total / limit)
    const pagination = {
      current: page,
      pages,
      total,
      hasNext: page < pages,
      hasPrev: page > 1
    }

    return NextResponse.json({
      success: true,
      author: {
        ...user,
        stats
      },
      posts,
      pagination
    })

  } catch (error) {
    console.error('Error fetching author data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch author data' },
      { status: 500 }
    )
  }
}
