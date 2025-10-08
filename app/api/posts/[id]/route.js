import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'
import User from '@/models/User'
import Notification from '@/models/Notification'
import { updateUserStats } from '@/lib/updateUserStats'

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
      .populate({ path: 'lastEditedBy', select: 'name email', strictPopulate: false })
      .populate({ path: 'revision.category', select: 'name slug color', strictPopulate: false })

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

// PUT - Update post with revision system
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
      editReason, // ✅ NEW: Admin must provide reason when editing author's post
      approveRevision, // ✅ NEW: Admin approving author's revision
      rejectRevision,  // ✅ NEW: Admin rejecting author's revision
      author
    } = updateData

    await connectDB()

    const post = await Post.findById(resolvedParams.id)
      .populate('author', 'name email')
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isAuthor = post.author._id.toString() === session.user.id
    const isAdmin = session.user.role === 'admin'
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own posts' },
        { status: 403 }
      )
    }

    // ========================================
    // ✅ ADMIN APPROVING/REJECTING REVISION
    // ========================================
    if (isAdmin && (approveRevision || rejectRevision)) {
      if (!post.hasRevision) {
        return NextResponse.json(
          { error: 'No pending revision found' },
          { status: 400 }
        )
      }

      if (approveRevision) {
        // Apply the revision to the main post
        post.title = post.revision.title
        post.content = post.revision.content
        post.excerpt = post.revision.excerpt
        post.featuredImageUrl = post.revision.featuredImageUrl
        post.featuredImageAlt = post.revision.featuredImageAlt
        post.category = post.revision.category
        post.tags = post.revision.tags
        post.seoTitle = post.revision.seoTitle
        post.seoDescription = post.revision.seoDescription
        post.seoKeywords = post.revision.seoKeywords
        
        // Clear revision
        post.hasRevision = false
        post.revision = undefined
        
        await post.save()

        // Notify author that revision was approved
        await Notification.createNotification({
          recipient: post.author._id,
          sender: session.user.id,
          type: 'post_published',
          post: post._id,
          message: `Your revision to "${post.title}" has been approved and published`,
          link: `/blog/${post.slug}`,
          metadata: {
            postTitle: post.title
          }
        })

        await post.populate('author', 'name email profilePictureUrl')
        await post.populate('category', 'name slug color')

        return NextResponse.json({
          message: 'Revision approved successfully',
          post
        })
      }

      if (rejectRevision) {
        post.revision.status = 'rejected'
        post.hasRevision = false
        
        await post.save()

        // Notify author that revision was rejected
        await Notification.createNotification({
          recipient: post.author._id,
          sender: session.user.id,
          type: 'post_published',
          post: post._id,
          message: `Your revision to "${post.title}" was rejected`,
          link: `/dashboard/posts/${post._id}`,
          metadata: {
            postTitle: post.title,
            editReason: rejectionReason || 'No reason provided'
          }
        })

        await post.populate('author', 'name email profilePictureUrl')
        await post.populate('category', 'name slug color')

        return NextResponse.json({
          message: 'Revision rejected',
          post
        })
      }
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

    // ✅ Verify author if being changed (admin only)
    if (author && author !== post.author._id.toString()) {
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

    // ========================================
    // ✅ AUTHOR EDITING PUBLISHED POST
    // ========================================
    if (isAuthor && post.status === 'published') {
      // Author cannot directly edit published post
      // Changes go to revision for admin approval
      
      post.hasRevision = true
      post.revision = {
        title: title || post.title,
        content: content || post.content,
        excerpt: excerpt !== undefined ? excerpt : post.excerpt,
        featuredImageUrl: featuredImageUrl !== undefined ? featuredImageUrl : post.featuredImageUrl,
        featuredImageAlt: featuredImageAlt !== undefined ? featuredImageAlt : post.featuredImageAlt,
        category: category || post.category,
        tags: tags || post.tags,
        seoTitle: seoTitle !== undefined ? seoTitle : post.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : post.seoDescription,
        seoKeywords: seoKeywords !== undefined ? seoKeywords : post.seoKeywords,
        submittedAt: new Date(),
        status: 'pending'
      }
      
      await post.save()

      // Notify all admins about pending revision
      const admins = await User.find({ role: 'admin', isActive: true })
      
      for (const admin of admins) {
        await Notification.createNotification({
          recipient: admin._id,
          sender: session.user.id,
          type: 'post_revision_pending',
          post: post._id,
          message: `${post.author.name} submitted a revision for "${post.title}"`,
          link: `/dashboard/posts/${post._id}`,
          metadata: {
            postTitle: post.title
          }
        })
      }

      await post.populate('author', 'name email profilePictureUrl')
      await post.populate('category', 'name slug color')

      return NextResponse.json({
        message: 'Revision submitted for approval. Your changes will be reviewed by an admin.',
        post,
        needsApproval: true
      })
    }

    // ========================================
    // ✅ ADMIN EDITING AUTHOR'S POST
    // ========================================
    if (isAdmin && !isAuthor) {
      // Admin must provide edit reason
      if (!editReason || editReason.trim().length === 0) {
        return NextResponse.json(
          { error: 'Please provide a reason for editing this post' },
          { status: 400 }
        )
      }

      // Track admin edit
      post.lastEditedBy = session.user.id
      post.lastEditedAt = new Date()
      post.editReason = editReason.trim()
    }

    // Store old values
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
          
          // Notify author that post was published
          if (!isAuthor) {
            await Notification.createNotification({
              recipient: post.author._id,
              sender: session.user.id,
              type: 'post_published',
              post: post._id,
              message: `Your post "${post.title}" has been published`,
              link: `/blog/${post.slug}`,
              metadata: {
                postTitle: post.title
              }
            })
          }
        } else if (status === 'rejected') {
          post.reviewedBy = session.user.id
          post.reviewedAt = new Date()
          if (rejectionReason) post.rejectionReason = rejectionReason
          
          // Notify author that post was rejected
          if (!isAuthor) {
            await Notification.createNotification({
              recipient: post.author._id,
              sender: session.user.id,
              type: 'post_published',
              post: post._id,
              message: `Your post "${post.title}" was rejected`,
              link: `/dashboard/posts/${post._id}`,
              metadata: {
                postTitle: post.title,
                editReason: rejectionReason || 'No reason provided'
              }
            })
          }
        }
      } else if (isAuthor) {
        // Author can only change to draft or pending_review if NOT published
        if (post.status !== 'published') {
          if (status === 'draft' || status === 'pending_review') {
            post.status = status
            if (status === 'pending_review') {
              post.reviewedBy = undefined
              post.reviewedAt = undefined
              post.rejectionReason = undefined
              
              // Notify all admins
              const admins = await User.find({ role: 'admin', isActive: true })
              for (const admin of admins) {
                await Notification.createNotification({
                  recipient: admin._id,
                  sender: session.user.id,
                  type: 'post_revision_pending',
                  post: post._id,
                  message: `${post.author.name} submitted "${post.title}" for review`,
                  link: `/dashboard/posts/${post._id}`,
                  metadata: {
                    postTitle: post.title
                  }
                })
              }
            }
          } else {
            return NextResponse.json(
              { error: 'Authors can only save as draft or submit for review' },
              { status: 403 }
            )
          }
        }
      }
    }

    // Only admins can set featured status
    if (isFeatured !== undefined && isAdmin) {
      post.isFeatured = isFeatured
    }

    await post.save()

    // ✅ Send notification if admin edited author's post
    if (isAdmin && !isAuthor && post.lastEditedBy) {
      await Notification.createNotification({
        recipient: post.author._id,
        sender: session.user.id,
        type: 'post_edited_by_admin',
        post: post._id,
        message: `Admin edited your post "${post.title}"`,
        link: `/dashboard/posts/${post._id}`,
        metadata: {
          editReason: editReason,
          postTitle: post.title
        }
      })
    }

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
    await post.populate('lastEditedBy', 'name email')

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

// DELETE post - ✅ Authors cannot delete published posts
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

    // ✅ AUTHORS CANNOT DELETE PUBLISHED POSTS
    if (isAuthor && !isAdmin && post.status === 'published') {
      return NextResponse.json(
        { 
          error: 'Published posts cannot be deleted. Please contact an administrator if you need to remove this post.',
          status: post.status
        },
        { status: 403 }
      )
    }

    // Store author ID before deletion
    const authorId = post.author

    if (post.status === 'published') {
      await Category.decrementPostCount(post.category)
    }

    await Post.findByIdAndDelete(resolvedParams.id)

    // ✅ UPDATE AUTHOR STATS
    await updateUserStats(authorId)

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
