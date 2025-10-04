import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import mongoose from 'mongoose'

// Helper function to check if string is a valid MongoDB ObjectId
function isValidObjectId(str) {
  return mongoose.Types.ObjectId.isValid(str) && /^[0-9a-fA-F]{24}$/.test(str)
}

// ✅ ADD: API Route Configuration for Vercel
export const runtime = 'nodejs' // Use Node.js runtime
export const dynamic = 'force-dynamic' // Always run dynamically
export const maxDuration = 10 // Maximum execution time (10s for hobby plan)

export async function GET(request, context) {
  try {
    // ✅ FIX: Add connection timeout
    const dbConnectPromise = connectDB()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 8000)
    )
    
    // Race between connection and timeout
    await Promise.race([dbConnectPromise, timeoutPromise])

    // Next.js 15: await params before accessing properties
    const params = await context.params
    const { identifier } = params
    
    console.log('🔍 Fetching author:', identifier)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 12
    const search = searchParams.get('search') || ''

    // Validate identifier
    if (!identifier || identifier.length < 3) {
      console.error('❌ Invalid identifier:', identifier)
      return NextResponse.json(
        { success: false, error: 'Invalid author identifier' },
        { status: 400 }
      )
    }

    // Determine if identifier is an ID or username
    let user
    if (isValidObjectId(identifier)) {
      // It's a MongoDB ObjectId
      console.log('🔑 Searching by ID:', identifier)
      user = await User.findById(identifier).select('-password').lean()
    } else {
      // It's a username
      console.log('👤 Searching by username:', identifier)
      user = await User.findOne({ 
        username: identifier.toLowerCase() 
      }).select('-password').lean()
    }

    if (!user) {
      console.error('❌ Author not found:', identifier)
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found author:', user.name)

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

    // ✅ FIX: Use Promise.all for parallel queries to save time
    const [total, posts, allAuthorPosts] = await Promise.all([
      Post.countDocuments(postsQuery),
      Post.find(postsQuery)
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime views likes category')
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.find({ 
        author: user._id, 
        status: 'published' 
      }).select('views likes').lean()
    ])

    // Calculate stats
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

    console.log('✅ Returning data for:', user.name, '- Posts:', posts.length)

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
    console.error('❌ Error in author API:', error.message)
    console.error('Stack:', error.stack)
    
    // ✅ ADD: Better error responses
    if (error.message === 'Database connection timeout') {
      return NextResponse.json(
        { success: false, error: 'Database connection timeout. Please try again.' },
        { status: 504 }
      )
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid author ID format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch author data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
