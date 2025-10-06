import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'
import { apiCache } from '@/lib/cache'

// GET posts with filters and pagination
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

    const session = await getServerSession(authOptions)
    
    // Check cache for public requests only
    if (!session && status === 'published') {
      const cacheKey = `posts-${page}-${limit}-${category || 'all'}-${author || 'all'}-${featured}-${slug || 'all'}`
      const cached = apiCache.get(cacheKey)
      if (cached) {
        return NextResponse.json(cached)
      }
    }
    
    // Build query based on user role and filters
    let query = {}
    
    // Public access - only published posts
    if (!session) {
      query.status = 'published'
    } else {
      // Authenticated users
      if (session.user.role === 'admin') {
        // Admins can see all posts
        if (status) query.status = status
      } else {
        // Authors can see their own posts + published posts from others
        if (status) {
          if (status === 'published') {
            query.status = 'published'
          } else {
            query = {
              $or: [
                { author: session.user.id, status },
                { status: 'published' }
              ]
            }
          }
        } else {
          query = {
            $or: [
              { author: session.user.id },
              { status: 'published' }
            ]
          }
        }
      }
    }

    // Apply additional filters
    if (category) query.category = category
    if (author) query.author = author
    if (featured) query.isFeatured = true
    if (slug) query.slug = slug

    // Handle search
    if (search) {
      query.$text = { $search: search }
    }

    const skip = (page - 1) * limit

    // Execute query
    let postsQuery = Post.find(query)
      .populate('author', 'name email profilePictureUrl')
      .populate('category', 'name slug color')
      .select('title slug excerpt content featuredImageUrl featuredImageAlt status publishedAt createdAt updatedAt readingTime views isFeatured allowComments likes comments')

    // Sort
    if (search) {
      postsQuery = postsQuery.sort({ score: { $meta: 'textScore' } })
    } else {
      postsQuery = postsQuery.sort({ 
        status: 1, // Draft first, then pending, published, rejected
        createdAt: -1 
      })
    }

    const posts = await postsQuery.skip(skip).limit(limit)

    // Get total count for pagination
    const total = await Post.countDocuments(query)

    const response = {
      posts,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
    
    // Cache public requests only
    if (!session && status === 'published') {
      const cacheKey = `posts-${page}-${limit}-${category || 'all'}-${author || 'all'}-${featured}-${slug || 'all'}`
      apiCache.set(cacheKey, response, 300) // 5 minutes
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new post (Authors and Admins)
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
      seoKeywords
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

    // Verify category exists
    const categoryExists = await Category.findById(category)
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
      seoKeywords: seoKeywords || []
    })

    await newPost.save()

    // Increment category post count if published
    if (postStatus === 'published') {
      await Category.incrementPostCount(category)
    }

    // Populate the saved post for response
    await newPost.populate('author', 'name email profilePictureUrl')
    await newPost.populate('category', 'name slug color')

    return NextResponse.json(
      {
        message: 'Post created successfully',
        post: newPost
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating post:', error)

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}