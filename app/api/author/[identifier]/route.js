import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import Category from '@/models/Category' // ✅ FIX: Import Category model
import mongoose from 'mongoose'

// Helper function to check if string is a valid MongoDB ObjectId
function isValidObjectId(str) {
  return mongoose.Types.ObjectId.isValid(str) && /^[0-9a-fA-F]{24}$/.test(str)
}

// ✅ API Route Configuration for Vercel
export const runtime = 'nodejs'
export const maxDuration = 10

export async function GET(request, context) {
  try {
    // ✅ Connect to database with timeout protection
    const dbConnectPromise = connectDB()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 8000)
    )

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
      console.log('🔑 Searching by ID:', identifier)
      user = await User.findById(identifier).select('-password').lean()
    } else {
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

    // ✅ Use Promise.all for parallel queries
    const [total, posts] = await Promise.all([
      Post.countDocuments(postsQuery),
      Post.find(postsQuery)
        .populate({
          path: 'category',
          select: 'name slug color',
          // ✅ Don't filter out posts without category
          options: { strictPopulate: false }
        })
        .select('title slug excerpt featuredImageUrl publishedAt readingTime views likes category contentType')
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    ])

    // ✅ Get stats from centralized service
    const { getAuthorStats } = require('@/lib/stats')
    const authorStats = await getAuthorStats(user._id.toString())

    const stats = authorStats ? {
      totalPosts: authorStats.postCount,
      totalViews: authorStats.totalViews,
      totalLikes: authorStats.totalLikes
    } : {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0
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

    // Better error responses
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
