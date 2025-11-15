import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'
import { redisCache, cacheWrapper, invalidatePostCaches } from '@/lib/redis-cache'

// ⚡ PERFORMANCE: Enable route segment config
export const revalidate = 300 // Revalidate every 5 minutes for ISR
export const dynamic = 'force-dynamic' // Since we need auth

// GET posts with filters and pagination - OPTIMIZED VERSION
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'
    const slug = searchParams.get('slug')
    const excludeRecipes = searchParams.get('excludeRecipes') === 'true'
    const contentType = searchParams.get('contentType')

    const session = await getServerSession(authOptions)
    
    // ⚡ OPTIMIZATION 1: Check cache for public requests only
    if (!session && status === 'published') {
      const cacheKey = `posts-${page}-${limit}-${category || 'all'}-${author || 'all'}-${featured}-${slug || 'all'}-${contentType || 'all'}-${excludeRecipes}`
      const cached = await redisCache.get(cacheKey)
      if (cached) {
        console.log('✅ Cache HIT:', cacheKey)
        return NextResponse.json(cached, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache-Status': 'HIT'
          }
        })
      }
    }
    
    // ✅ BUILD QUERY BASED ON USER ROLE AND FILTERS
    let query = {}
    
    // Public access - only published posts
    if (!session) {
      query.status = 'published'
    } else {
      // Authenticated users
      if (session.user.role === 'admin') {
        if (status) query.status = status
      } else {
        query.author = session.user.id
        if (status) query.status = status
      }
    }

    // Apply additional filters
    if (category) query.category = category
    if (author) query.author = author
    if (featured) query.isFeatured = true
    if (slug) query.slug = slug
    if (contentType) query.contentType = contentType
    if (excludeRecipes) query.contentType = { $ne: 'recipe' }

    // Handle search
    if (search) {
      query.$text = { $search: search }
    }

    const skip = (page - 1) * limit

    // ⚡ OPTIMIZATION 2: Use .lean() for 5-10x faster queries
    // ⚡ OPTIMIZATION 3: Select only needed fields to reduce bandwidth
    let postsQuery = Post.find(query)
      .populate('author', 'name email profilePictureUrl')
      .populate('category', 'name slug color')
      .select('title slug excerpt content featuredImageUrl featuredImageAlt contentType status publishedAt createdAt updatedAt readingTime views isFeatured allowComments')
      .lean() // ⚡ CRITICAL: Converts to plain JS objects (5-10x faster)

    // Sort
    if (search) {
      postsQuery = postsQuery.sort({ score: { $meta: 'textScore' } })
    } else {
      postsQuery = postsQuery.sort({ 
        status: 1,
        createdAt: -1 
      })
    }

    // ⚡ OPTIMIZATION 4: Use Promise.all to run queries in parallel
    const [posts, total] = await Promise.all([
      postsQuery.skip(skip).limit(limit),
      Post.countDocuments(query)
    ])

    // ⚡ OPTIMIZATION 5: Add computed fields efficiently
    const postsWithStats = posts.map(post => ({
      ...post,
      likeCount: post.likes?.length || 0,
      commentCount: post.comments?.filter(c => c.isApproved).length || 0,
      // Remove sensitive data for public API
      ...((!session || session.user.role !== 'admin') && {
        likes: undefined,
        comments: undefined
      })
    }))

    const response = {
      posts: postsWithStats,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
    
    // ⚡ OPTIMIZATION 6: Cache public requests with longer TTL
    if (!session && status === 'published') {
      const cacheKey = `posts-${page}-${limit}-${category || 'all'}-${author || 'all'}-${featured}-${slug || 'all'}-${contentType || 'all'}-${excludeRecipes}`
      await redisCache.set(cacheKey, response, 300) // 5 minutes
      console.log('✅ Cache SET:', cacheKey)
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': !session 
          ? 'public, s-maxage=300, stale-while-revalidate=600'
          : 'no-store, no-cache, must-revalidate',
        'X-Cache-Status': 'MISS'
      }
    })

  } catch (error) {
    console.error('❌ Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new post (Authors and Admins) - OPTIMIZED
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const {
      title,
      content,
      excerpt,
      featuredImageUrl,
      featuredImageAlt,
      category,
      tags,
      status,
      isFeatured,
      allowComments,
      seoTitle,
      seoDescription,
      seoKeywords,
      lang,
      translationOf,
      contentType,
      recipePrepTime,
      recipeCookTime,
      recipeServings,
      recipeIngredients,
      recipeCuisine,
      recipeDiet,
      diyDifficulty,
      diyMaterials,
      diyTools,
      diyEstimatedTime,
      affiliateLinks
    } = await request.json()

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Post title is required' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title cannot be more than 200 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    // ⚡ OPTIMIZATION: Use lean() to verify category faster
    const categoryExists = await Category.findById(category).lean()
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate status - only admins can directly publish
    let postStatus = status || 'draft'
    if (postStatus === 'published' && session.user.role !== 'admin') {
      postStatus = 'pending_review'
    }

    // Only admins can set featured posts
    const postIsFeatured = (session.user.role === 'admin') ? (isFeatured || false) : false

    // Create new post
    const newPost = new Post({
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt ? excerpt.trim() : undefined,
      featuredImageUrl: featuredImageUrl || null,
      featuredImageAlt: featuredImageAlt || '',
      author: session.user.id,
      category,
      tags: tags || [],
      status: postStatus,
      isFeatured: postIsFeatured,
      allowComments: allowComments !== undefined ? allowComments : true,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      seoKeywords: seoKeywords || [],
      lang: lang || 'en',
      translationOf: translationOf || null,
      contentType: contentType || 'blog',
      recipePrepTime: recipePrepTime || null,
      recipeCookTime: recipeCookTime || null,
      recipeServings: recipeServings || null,
      recipeIngredients: recipeIngredients || [],
      recipeCuisine: recipeCuisine || null,
      recipeDiet: recipeDiet || [],
      diyDifficulty: diyDifficulty || null,
      diyMaterials: diyMaterials || [],
      diyTools: diyTools || [],
      diyEstimatedTime: diyEstimatedTime || null,
      affiliateLinks: affiliateLinks || []
    })

    await newPost.save()

    // ✅ Invalidate caches after creating post
    invalidatePostCaches()

    // Increment category post count if published
    if (postStatus === 'published') {
      await Category.incrementPostCount(category)
    }

    // ⚡ OPTIMIZATION: Use lean() when populating for response
    const savedPost = await Post.findById(newPost._id)
      .populate('author', 'name email profilePictureUrl')
      .populate('category', 'name slug color')
      .lean()

    return NextResponse.json(
      {
        message: 'Post created successfully',
        post: savedPost
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ Error creating post:', error)

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
