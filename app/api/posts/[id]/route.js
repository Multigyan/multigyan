import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'
import User from '@/models/User' // ✅ Import User model

// GET single post
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    
    await connectDB()

    const session = await getServerSession(authOptions)
    
    let query = { _id: resolvedParams.id }
    
    if (!session) {
      query.status = 'published'
    } else if (session.user.role !== 'admin') {
      query = {
        _id: resolvedParams.id,
        $or: [
          { author: session.user.id },
          { status: 'published' }
        ]
      }
    }

    const post = await Post.findOne(query)
      .populate('author', 'name email profilePictureUrl bio')
      .populate('category', 'name slug color description')
      .populate('reviewedBy', 'name email')

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.status === 'published' && (!session || session.user.id !== post.author._id.toString())) {
      await post.incrementViews()
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update post
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const updateData = await request.json()
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
      rejectionReason,
      author // ✅ NEW: Accept author field
    } = updateData

    await connectDB()

    const post = await Post.findById(resolvedParams.id)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isAuthor = post.author.toString() === session.user.id
    const isAdmin = session.user.role === 'admin'
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own posts' },
        { status: 403 }
      )
    }

    // Validation
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Post title is required' },
          { status: 400 }
        )
      }
      if (title.length > 200) {
        return NextResponse.json(
          { error: 'Title cannot be more than 200 characters' },
          { status: 400 }
        )
      }
    }

    if (content !== undefined && (!content || content.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      )
    }

    // Verify category if being updated
    if (category && category !== post.category.toString()) {
      const categoryExists = await Category.findById(category)
      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    // ✅ NEW: Verify author if being changed (admin only)
    if (author && author !== post.author.toString()) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only admins can change post author' },
          { status: 403 }
        )
      }
      
      const newAuthor = await User.findById(author)
      if (!newAuthor) {
        return NextResponse.json(
          { error: 'Invalid author selected' },
          { status: 400 }
        )
      }
      
      post.author = author
    }

    // Store old values for potential rollback
    const oldStatus = post.status
    const oldCategory = post.category.toString()

    // Update basic fields
    if (title !== undefined) post.title = title.trim()
    if (content !== undefined) post.content = content.trim()
    if (excerpt !== undefined) post.excerpt = excerpt ? excerpt.trim() : undefined
    if (featuredImageUrl !== undefined) post.featuredImageUrl = featuredImageUrl
    if (featuredImageAlt !== undefined) post.featuredImageAlt = featuredImageAlt
    if (tags !== undefined) post.tags = tags
    if (allowComments !== undefined) post.allowComments = allowComments
    if (seoTitle !== undefined) post.seoTitle = seoTitle
    if (seoDescription !== undefined) post.seoDescription = seoDescription
    if (seoKeywords !== undefined) post.seoKeywords = seoKeywords

    // Handle category change
    if (category && category !== oldCategory) {
      if (oldStatus === 'published') {
        await Category.decrementPostCount(oldCategory)
      }
      post.category = category
    }

    // Handle status changes with role-based restrictions
    if (status !== undefined) {
      if (isAdmin) {
        post.status = status
        
        if (status === 'published' && oldStatus === 'pending_review') {
          post.reviewedBy = session.user.id
          post.reviewedAt = new Date()
          post.rejectionReason = undefined
        } else if (status === 'rejected') {
          post.reviewedBy = session.user.id
          post.reviewedAt = new Date()
          if (rejectionReason) post.rejectionReason = rejectionReason
        }
      } else if (isAuthor) {
        if (status === 'draft' || status === 'pending_review') {
          post.status = status
          if (status === 'pending_review') {
            post.reviewedBy = undefined
            post.reviewedAt = undefined
            post.rejectionReason = undefined
          }
        } else {
          return NextResponse.json(
            { error: 'Authors can only save as draft or submit for review' },
            { status: 403 }
          )
        }
      }
    }

    // Only admins can set featured status
    if (isFeatured !== undefined && isAdmin) {
      post.isFeatured = isFeatured
    }

    await post.save()

    // Update category post counts based on status changes
    const newStatus = post.status
    if (oldStatus !== newStatus) {
      if (oldStatus === 'published' && newStatus !== 'published') {
        await Category.decrementPostCount(post.category)
      } else if (oldStatus !== 'published' && newStatus === 'published') {
        await Category.incrementPostCount(post.category)
      }
    }

    // Populate for response
    await post.populate('author', 'name email profilePictureUrl')
    await post.populate('category', 'name slug color')
    await post.populate('reviewedBy', 'name email')

    return NextResponse.json({
      message: 'Post updated successfully',
      post
    })

  } catch (error) {
    console.error('Error updating post:', error)

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

// DELETE post
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectDB()

    const post = await Post.findById(resolvedParams.id)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const isAuthor = post.author.toString() === session.user.id
    const isAdmin = session.user.role === 'admin'
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own posts' },
        { status: 403 }
      )
    }

    if (post.status === 'published') {
      await Category.decrementPostCount(post.category)
    }

    await Post.findByIdAndDelete(resolvedParams.id)

    return NextResponse.json({
      message: 'Post deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
