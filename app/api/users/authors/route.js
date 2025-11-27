import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { apiCache } from '@/lib/cache'
import logger from '@/lib/logger'

export async function GET() {
  try {
    await connectDB()
    
    // Check cache
    const cacheKey = 'authors-count'
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Get count of all users with role 'author' or 'admin'
    const total = await User.countDocuments({ 
      role: { $in: ['author', 'admin'] } 
    })

    const response = { 
      success: true,
      total 
    }
    
    // Cache for 5 minutes
    apiCache.set(cacheKey, response, 300)

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Error fetching authors count:', { error })
    return NextResponse.json(
      { error: 'Failed to fetch authors count' },
      { status: 500 }
    )
  }
}
