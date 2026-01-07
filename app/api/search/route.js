import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'
import User from '@/models/User'

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // all, posts, categories, authors
    const limit = parseInt(searchParams.get('limit')) || 10

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        results: {
          posts: [],
          categories: [],
          authors: []
        },
        total: 0
      })
    }

    const searchQuery = query.trim()
    const results = {
      posts: [],
      categories: [],
      authors: []
    }

    // Search in Posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        status: 'published',
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { excerpt: { $regex: searchQuery, $options: 'i' } },
          { content: { $regex: searchQuery, $options: 'i' } },
          { tags: { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .populate('author', 'name profilePictureUrl username')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImageUrl featuredImageAlt readingTime publishedAt likes comments views isFeatured')
        .sort({ publishedAt: -1 })
        .limit(limit)
        .lean()

      // ✅ Calculate virtuals manually since .lean() doesn't include them
      const postsWithCounts = posts.map(post => ({
        ...post,
        likeCount: post.likes?.length || 0,
        commentCount: post.comments?.filter(c => c.isApproved).length || 0
      }))

      results.posts = postsWithCounts
    }

    // Search in Categories
    if (type === 'all' || type === 'categories') {
      const categories = await Category.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .select('name slug description color postCount')
        .limit(limit)
        .lean()

      results.categories = categories
    }

    // Search in Authors
    if (type === 'all' || type === 'authors') {
      const authors = await User.find({
        role: { $in: ['author', 'admin'] },
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { bio: { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .select('name bio profilePictureUrl')
        .limit(limit)
        .lean()

      results.authors = authors
    }

    const total = results.posts.length + results.categories.length + results.authors.length

    return NextResponse.json({
      success: true,
      query: searchQuery,
      results,
      total
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform search',
        results: { posts: [], categories: [], authors: [] },
        total: 0
      },
      { status: 500 }
    )
  }
}
