import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'
import User from '@/models/User'
import Notification from '@/models/Notification'
import { updateUserStats } from '@/lib/updateUserStats'
import { invalidatePostCaches } from '@/lib/cache'

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
      author,
      // ✨ NEW FIELDS FOR LANGUAGE & TRANSLATION
      lang,
      translationOf,
      // ✨ CONTENT TYPE
      contentType,
      // ✨ RECIPE-SPECIFIC FIELDS (Phase 2)
      recipePrepTime,
      recipeCookTime,
      recipeServings,
      recipeIngredients,
      recipeCuisine,
      recipeDiet,
      // ✨ DIY-SPECIFIC FIELDS
      diyDifficulty,
      diyMaterials,
      diyTools,
      diyEstimatedTime,
      // ✨ AFFILIATE LINKS
      affiliateLinks
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

      // ✅ FIX: Sanitize ALL fields BEFORE creating revision to avoid validation errors
      let revisionTags = tags || post.tags
      if (Array.isArray(revisionTags)) {
        revisionTags = revisionTags.filter(tag => tag && typeof tag === 'string' && tag.length > 0 && tag.length <= 30)
      }

      let revisionSeoKeywords = seoKeywords || post.seoKeywords
      if (Array.isArray(revisionSeoKeywords)) {
        revisionSeoKeywords = revisionSeoKeywords
          .filter(kw => kw && typeof kw === 'string')
          .map(kw => kw.trim().slice(0, 50))
          .filter(kw => kw.length > 0)
      }

      post.hasRevision = true
      post.revision = {
        title: (title || post.title).slice(0, 200),
        content: content || post.content,
        excerpt: excerpt !== undefined ? (excerpt ? excerpt.slice(0, 300) : undefined) : post.excerpt,
        featuredImageUrl: featuredImageUrl !== undefined ? featuredImageUrl : post.featuredImageUrl,
        featuredImageAlt: featuredImageAlt !== undefined ? (featuredImageAlt ? featuredImageAlt.slice(0, 100) : undefined) : post.featuredImageAlt,
        category: category || post.category,
        tags: revisionTags, // ✅ Use sanitized tags
        seoTitle: seoTitle !== undefined ? (seoTitle ? seoTitle.slice(0, 60) : undefined) : post.seoTitle,
        seoDescription: seoDescription !== undefined ? (seoDescription ? seoDescription.slice(0, 160) : undefined) : post.seoDescription,
        seoKeywords: revisionSeoKeywords, // ✅ Use sanitized keywords
        submittedAt: new Date(),
        status: 'pending'
      }

      // ✅ Also sanitize the main post.tags to avoid validation errors
      if (Array.isArray(post.tags)) {
        const sanitizedMainTags = post.tags.filter(tag => tag && typeof tag === 'string' && tag.length > 0 && tag.length <= 30)
        if (sanitizedMainTags.length !== post.tags.length) {
          console.log('Backend: Sanitizing post.tags before save:', post.tags, '->', sanitizedMainTags)
          post.tags = sanitizedMainTags
        }
      }

      // ✅ Sanitize all other fields in main post to avoid validation
      if (post.featuredImageAlt && post.featuredImageAlt.length > 100) {
        post.featuredImageAlt = post.featuredImageAlt.slice(0, 100)
      }
      if (post.seoTitle && post.seoTitle.length > 80) {
        post.seoTitle = post.seoTitle.slice(0, 60)
      }
      if (post.seoDescription && post.seoDescription.length > 210) {
        post.seoDescription = post.seoDescription.slice(0, 160)
      }
      if (Array.isArray(post.seoKeywords)) {
        post.seoKeywords = post.seoKeywords
          .filter(kw => kw && typeof kw === 'string')
          .map(kw => kw.slice(0, 50))
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

    // ✅ SANITIZE ALL FIELDS: Ensure data meets validation requirements
    const sanitizedData = {}

    // Basic text fields with truncation
    if (title !== undefined) {
      sanitizedData.title = title.trim().slice(0, 200) // Max 200 chars
    }
    if (content !== undefined) {
      sanitizedData.content = content.trim()
    }
    if (excerpt !== undefined) {
      sanitizedData.excerpt = excerpt ? excerpt.trim().slice(0, 300) : undefined // Max 300 chars
    }

    // Image fields
    if (featuredImageUrl !== undefined) {
      sanitizedData.featuredImageUrl = featuredImageUrl
    }
    if (featuredImageAlt !== undefined) {
      sanitizedData.featuredImageAlt = featuredImageAlt ? featuredImageAlt.trim().slice(0, 100) : undefined // Max 100 chars
    }

    // SEO fields with proper truncation
    if (seoTitle !== undefined) {
      sanitizedData.seoTitle = seoTitle ? seoTitle.trim().slice(0, 60) : undefined // Max 60 chars (best practice)
    }
    if (seoDescription !== undefined) {
      sanitizedData.seoDescription = seoDescription ? seoDescription.trim().slice(0, 160) : undefined // Max 160 chars (best practice)
    }
    if (seoKeywords !== undefined) {
      // Sanitize SEO keywords - max 50 chars each
      if (Array.isArray(seoKeywords)) {
        sanitizedData.seoKeywords = seoKeywords
          .filter(kw => kw && typeof kw === 'string')
          .map(kw => kw.trim().slice(0, 50))
          .filter(kw => kw.length > 0)
      }
    }

    // Tags - already sanitized above, just include here
    if (tags !== undefined) {
      const sanitizedTags = tags.filter(tag => tag && typeof tag === 'string' && tag.length > 0 && tag.length <= 30)
      console.log('Backend: Sanitizing tags:', tags, '->', sanitizedTags)
      sanitizedData.tags = sanitizedTags
    }

    // Boolean and other fields
    if (allowComments !== undefined) sanitizedData.allowComments = allowComments
    if (category !== undefined) sanitizedData.category = category
    if (author !== undefined) sanitizedData.author = author
    if (status !== undefined) sanitizedData.status = status
    if (isFeatured !== undefined && isAdmin) sanitizedData.isFeatured = isFeatured
    if (editReason !== undefined) sanitizedData.editReason = editReason ? editReason.trim().slice(0, 500) : undefined
    if (rejectionReason !== undefined) sanitizedData.rejectionReason = rejectionReason ? rejectionReason.trim().slice(0, 500) : undefined
    // ✨ NEW FIELDS FOR LANGUAGE & TRANSLATION
    if (lang !== undefined) sanitizedData.lang = lang || 'en'
    if (translationOf !== undefined) sanitizedData.translationOf = translationOf || null

    // ✨ CONTENT TYPE
    if (contentType !== undefined) sanitizedData.contentType = contentType || 'blog'

    // ✨ RECIPE-SPECIFIC FIELDS (Phase 2)
    if (recipePrepTime !== undefined) sanitizedData.recipePrepTime = recipePrepTime || null
    if (recipeCookTime !== undefined) sanitizedData.recipeCookTime = recipeCookTime || null
    if (recipeServings !== undefined) sanitizedData.recipeServings = recipeServings || null
    if (recipeIngredients !== undefined) sanitizedData.recipeIngredients = recipeIngredients || []
    if (recipeCuisine !== undefined) sanitizedData.recipeCuisine = recipeCuisine || null
    if (recipeDiet !== undefined) sanitizedData.recipeDiet = recipeDiet || []

    // ✨ DIY-SPECIFIC FIELDS
    if (diyDifficulty !== undefined) sanitizedData.diyDifficulty = diyDifficulty || null
    if (diyMaterials !== undefined) sanitizedData.diyMaterials = diyMaterials || []
    if (diyTools !== undefined) sanitizedData.diyTools = diyTools || []
    if (diyEstimatedTime !== undefined) sanitizedData.diyEstimatedTime = diyEstimatedTime || null

    // ✨ AFFILIATE LINKS
    if (affiliateLinks !== undefined) sanitizedData.affiliateLinks = affiliateLinks || []

    // Admin edit tracking
    if (isAdmin && !isAuthor) {
      sanitizedData.lastEditedBy = session.user.id
      sanitizedData.lastEditedAt = new Date()
    }

    console.log('Backend: Sanitized data ready for update:', Object.keys(sanitizedData))

    // ✅ FIX: Use Mongoose save() instead of direct MongoDB update
    // This ensures updatedAt timestamp is updated and middleware runs
    Object.assign(post, sanitizedData)

    // Note: We'll save the post after handling status changes below

    // Store old values for comparison
    const oldStatus = post.status
    const oldCategory = post.category.toString()

    // Handle status changes with role-based restrictions
    if (status !== undefined) {
      if (isAdmin) {
        post.status = status

        // ✅ FIX ISSUE 2: Set publishedAt whenever status changes to 'published'
        // This ensures draft-to-published posts get the correct publish timestamp
        if (status === 'published') {
          post.publishedAt = new Date()
          post.reviewedBy = session.user.id
          post.reviewedAt = new Date()
          post.rejectionReason = undefined

          // Notify author that post was published (only if coming from pending_review)
          if (oldStatus === 'pending_review' && !isAuthor) {
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

    // Handle category post count updates based on status/category changes
    const newStatus = sanitizedData.status || post.status
    const newCategory = sanitizedData.category || post.category.toString()

    if (oldStatus !== newStatus || oldCategory !== newCategory) {
      if (oldStatus === 'published' && newStatus !== 'published') {
        await Category.decrementPostCount(oldCategory)
      } else if (oldStatus !== 'published' && newStatus === 'published') {
        await Category.incrementPostCount(newCategory)
      } else if (oldStatus === 'published' && newStatus === 'published' && oldCategory !== newCategory) {
        // Category changed while post was published
        await Category.decrementPostCount(oldCategory)
        await Category.incrementPostCount(newCategory)
      }
    }

    // ✅ Send notification if admin edited author's post
    if (isAdmin && !isAuthor && sanitizedData.editReason) {
      await Notification.createNotification({
        recipient: post.author._id,
        sender: session.user.id,
        type: 'post_edited_by_admin',
        post: post._id,
        message: `Admin edited your post "${sanitizedData.title || post.title}"`,
        link: `/dashboard/posts/${post._id}`,
        metadata: {
          editReason: sanitizedData.editReason,
          postTitle: sanitizedData.title || post.title
        }
      })
    }

    // ✅ FIX ISSUE 1: Explicitly mark updatedAt as modified to ensure it updates
    // This fixes the issue where admin edits weren't showing updated timestamp
    post.markModified('updatedAt')

    // ✅ SAVE: Now save all changes with proper Mongoose middleware
    await post.save()

    // ✅ Reload post from database to get updated values with populated fields
    // Use lean() to bypass Mongoose cache and get fresh data
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email profilePictureUrl')
      .populate('category', 'name slug color')
      .populate('reviewedBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .lean()

    // ✅ Invalidate caches after updating post
    invalidatePostCaches()

    return NextResponse.json({
      message: 'Post updated successfully',
      post: updatedPost
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

    // ✅ Invalidate caches after deleting post
    invalidatePostCaches()

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
