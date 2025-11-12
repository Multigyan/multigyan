import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

// Diagnostic endpoint to check recipe posts
// Visit: /api/debug/recipes
export async function GET() {
  try {
    console.log('🔍 Diagnostic: Connecting to database...')
    await connectDB()
    console.log('✅ Diagnostic: Database connected')
    
    // Check all posts
    const allPosts = await Post.countDocuments()
    
    // Check recipe posts
    const recipePosts = await Post.countDocuments({ 
      contentType: 'recipe' 
    })
    
    // Check published recipes
    const publishedRecipes = await Post.countDocuments({ 
      contentType: 'recipe',
      status: 'published'
    })
    
    // Get sample recipes
    const sampleRecipes = await Post.find({ 
      contentType: 'recipe' 
    })
      .select('title contentType status publishedAt')
      .limit(5)
      .lean()
    
    // Get content type distribution
    const contentTypes = await Post.aggregate([
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 }
        }
      }
    ])
    
    console.log('✅ Diagnostic: Data retrieved successfully')
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        totalPosts: allPosts,
        totalRecipes: recipePosts,
        publishedRecipes: publishedRecipes
      },
      contentTypeDistribution: contentTypes,
      sampleRecipes: sampleRecipes.map(r => ({
        id: r._id.toString(),
        title: r.title,
        contentType: r.contentType,
        status: r.status,
        publishedAt: r.publishedAt
      }))
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('❌ Diagnostic error:', error)
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 })
  }
}
