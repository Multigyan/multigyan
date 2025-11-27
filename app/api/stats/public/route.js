import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import Category from '@/models/Category'
import { apiCache } from '@/lib/cache'
import logger from '@/lib/logger'

export async function GET() {
  try {
    await connectDB()
    
    // Check cache first
    const cacheKey = 'public-stats'
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }
    
    // Get ACTUAL counts from database
    const [publishedCount, authorsCount, categoriesCount] = await Promise.all([
      Post.countDocuments({ status: 'published' }),
      User.countDocuments({ role: { $in: ['author', 'admin'] } }),
      Category.countDocuments({ isActive: true })
    ])
    
    const response = {
      totalPosts: publishedCount,
      totalAuthors: authorsCount,
      totalCategories: categoriesCount
    }
    
    // Cache for 5 minutes
    apiCache.set(cacheKey, response, 300)
    
    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error fetching public stats:', { error })
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
