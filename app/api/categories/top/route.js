import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Post from '@/models/Post'
import { apiCache } from '@/lib/cache'

export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 8
    
    // Check cache
    const cacheKey = `categories-top-${limit}`
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Get all active categories
    const categories = await Category.find({ isActive: true })
      .select('name slug description color')
      .lean()

    // Get actual post counts for each category
    const categoryCounts = await Post.aggregate([
      { $match: { status: 'published' } },
      { 
        $group: { 
          _id: '$category',
          postCount: { $sum: 1 }
        }
      }
    ])

    // Merge categories with their post counts
    const categoriesWithCounts = categories.map(category => {
      const stats = categoryCounts.find(stat => 
        stat._id && stat._id.toString() === category._id.toString()
      )
      return {
        ...category,
        _id: category._id.toString(),
        postCount: stats?.postCount || 0
      }
    })

    // Filter out categories with 0 posts and sort by post count
    const activeCategories = categoriesWithCounts
      .filter(cat => cat.postCount > 0)
      .sort((a, b) => b.postCount - a.postCount)

    const totalActiveCategories = activeCategories.length
    const topCategories = activeCategories.slice(0, limit)

    const response = {
      categories: topCategories,
      total: totalActiveCategories
    }
    
    // Cache for 5 minutes
    apiCache.set(cacheKey, response, 300)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching top categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
