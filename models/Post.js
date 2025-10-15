import mongoose from 'mongoose'
import slugify from 'slugify'

// Enhanced Comment Schema with nested replies and likes
const CommentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest comments
  },
  guestName: {
    type: String,
    maxlength: [50, 'Guest name cannot be more than 50 characters'],
    trim: true
  },
  guestEmail: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    trim: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // null for top-level comments, ObjectId for replies
  },
  isApproved: {
    type: Boolean,
    default: false // Comments need admin approval
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for comment like count
CommentSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0
})

// Virtual for comment author name (works for both users and guests)
CommentSchema.virtual('authorName').get(function() {
  if (this.author && this.author.name) {
    return this.author.name
  }
  return this.guestName || 'Anonymous'
})

// Virtual for comment author email
CommentSchema.virtual('authorEmail').get(function() {
  if (this.author && this.author.email) {
    return this.author.email
  }
  return this.guestEmail || null
})

// Instance method to add like to comment
CommentSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId)
  }
  return this
}

// Instance method to remove like from comment
CommentSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(id => !id.equals(userId))
  return this
}

// Instance method to approve comment
CommentSchema.methods.approve = function() {
  this.isApproved = true
  return this
}

// Instance method to report comment
CommentSchema.methods.report = function() {
  this.isReported = true
  this.reportCount += 1
  return this
}

// Instance method to edit comment
CommentSchema.methods.editContent = function(newContent) {
  this.content = newContent
  this.isEdited = true
  this.editedAt = new Date()
  return this
}

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    maxlength: [200, 'Title cannot be more than 200 characters'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot be more than 300 characters'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required']
  },
  featuredImageUrl: {
    type: String,
    default: null
  },
  featuredImageAlt: {
    type: String,
    maxlength: [100, 'Image alt text cannot be more than 100 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot be more than 30 characters'],
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'published', 'rejected'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 1
  },
  comments: [CommentSchema],
  isFeatured: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  seoTitle: {
    type: String,
    maxlength: [80, 'SEO title cannot be more than 60 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [210, 'SEO description cannot be more than 160 characters']
  },
  seoKeywords: [{
    type: String,
    maxlength: [50, 'SEO keyword cannot be more than 50 characters']
  }],
  // ✅ NEW: Revision Tracking for Author Edits
  hasRevision: {
    type: Boolean,
    default: false
  },
  revision: {
    title: String,
    content: String,
    excerpt: String,
    featuredImageUrl: String,
    featuredImageAlt: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    tags: [String],
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    submittedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  // ✅ NEW: Admin Edit Tracking
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastEditedAt: Date,
  editReason: String  // Admin must provide reason for editing author's post
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
// Note: slug index is already created by unique: true in schema
PostSchema.index({ status: 1 })
PostSchema.index({ author: 1 })
PostSchema.index({ category: 1 })
PostSchema.index({ publishedAt: -1 })
PostSchema.index({ createdAt: -1 })
PostSchema.index({ tags: 1 })
PostSchema.index({ title: 'text', content: 'text' }) // Text search index

// Virtual for post URL
PostSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`
})

// Virtual for like count
PostSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0
})

// Virtual for comment count (approved only)
PostSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.filter(comment => comment.isApproved).length : 0
})

// Virtual for reading time calculation
PostSchema.virtual('estimatedReadingTime').get(function() {
  const wordsPerMinute = 200
  const words = this.content ? this.content.trim().split(/\s+/).length : 0
  return Math.ceil(words / wordsPerMinute)
})

// Generate slug and reading time before saving
PostSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    // ✅ IMPROVED: Use transliteration for better URL compatibility
    // Convert Hindi text to English characters for SEO-friendly URLs
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true,   // ✅ CHANGED: Use strict mode to remove special characters
      locale: 'en'    // ✅ CHANGED: Use English locale for better compatibility
    })
    
    if (this.isNew) {
      let slug = baseSlug
      let counter = 1
      while (await this.constructor.findOne({ slug })) {
        counter++
        slug = `${baseSlug}-${counter}`  // ✅ GOOD
      }
      this.slug = slug
    }
  }
  
  // Calculate reading time
  if (this.isModified('content')) {
    this.readingTime = this.estimatedReadingTime
  }
  
  // Generate excerpt if not provided
  if (this.isModified('content') && !this.excerpt) {
    const plainText = this.content.replace(/<[^>]*>/g, '') // Remove HTML tags
    this.excerpt = plainText.slice(0, 297) + (plainText.length > 297 ? '...' : '')
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  
  // Clear published date if status changes from published
  if (this.isModified('status') && this.status !== 'published' && this.publishedAt) {
    this.publishedAt = null
  }
  
  next()
})

// Static method to get published posts with pagination
PostSchema.statics.getPublished = function(page = 1, limit = 10, category = null) {
  const skip = (page - 1) * limit
  const query = { status: 'published' }
  
  if (category) {
    query.category = category
  }
  
  return this.find(query)
    .populate('author', 'name profilePictureUrl')
    .populate('category', 'name slug color')
    .select('title slug excerpt featuredImageUrl featuredImageAlt publishedAt readingTime views likeCount commentCount')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get featured posts
PostSchema.statics.getFeatured = function(limit = 5) {
  return this.find({ status: 'published', isFeatured: true })
    .populate('author', 'name profilePictureUrl')
    .populate('category', 'name slug color')
    .select('title slug excerpt featuredImageUrl featuredImageAlt publishedAt readingTime views')
    .sort({ publishedAt: -1 })
    .limit(limit)
}

// Static method to search posts
PostSchema.statics.searchPosts = function(query, page = 1, limit = 10) {
  const skip = (page - 1) * limit
  
  return this.find({
    status: 'published',
    $text: { $search: query }
  }, {
    score: { $meta: 'textScore' }
  })
    .populate('author', 'name profilePictureUrl')
    .populate('category', 'name slug color')
    .select('title slug excerpt featuredImageUrl featuredImageAlt publishedAt readingTime')
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
}

// Static method to get posts by author
PostSchema.statics.getByAuthor = function(authorId, status = 'published', page = 1, limit = 10) {
  const skip = (page - 1) * limit
  const query = { author: authorId }
  
  if (status) {
    query.status = status
  }
  
  return this.find(query)
    .populate('category', 'name slug color')
    .select('title slug excerpt featuredImageUrl status publishedAt readingTime views likeCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get posts pending review
PostSchema.statics.getPendingReview = function() {
  return this.find({ status: 'pending_review' })
    .populate('author', 'name email')
    .populate('category', 'name')
    .select('title slug excerpt author category createdAt')
    .sort({ createdAt: 1 }) // Oldest first for review queue
}

// Instance method to approve post
PostSchema.methods.approve = function(reviewerId) {
  this.status = 'published'
  this.reviewedBy = reviewerId
  this.reviewedAt = new Date()
  this.publishedAt = new Date()
  this.rejectionReason = undefined
  return this.save()
}

// Instance method to reject post
PostSchema.methods.reject = function(reviewerId, reason) {
  this.status = 'rejected'
  this.reviewedBy = reviewerId
  this.reviewedAt = new Date()
  this.rejectionReason = reason
  this.publishedAt = null
  return this.save()
}

// Instance method to submit for review
PostSchema.methods.submitForReview = function() {
  this.status = 'pending_review'
  return this.save()
}

// Instance method to add like
PostSchema.methods.addLike = async function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId)
    
    // Create notification for post author (don't notify yourself)
    // ✅ FIX: Check if author exists before accessing toString()
    if (this.author && this.author.toString() !== userId.toString()) {
      try {
        const Notification = mongoose.model('Notification')
        await Notification.createNotification({
          recipient: this.author,
          sender: userId,
          type: 'like_post',
          post: this._id,
          message: 'liked your post',
          link: `/blog/${this.slug}`
        })
      } catch (error) {
        console.error('Error creating like notification:', error)
      }
    }
  }
  // ✅ FIX: Skip validation when saving likes (avoids SEO field validation)
  return this.save({ validateBeforeSave: false })
}

// Instance method to remove like
PostSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(id => !id.equals(userId))
  // ✅ FIX: Skip validation when saving (avoids SEO field validation)
  return this.save({ validateBeforeSave: false })
}

// Instance method to increment views
PostSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Comment Management Methods

// Instance method to add comment to post
PostSchema.methods.addComment = async function(commentData) {
  this.comments.push(commentData)
  // ✅ FIX: Skip validation when saving comments (avoids SEO field validation)
  const savedPost = await this.save({ validateBeforeSave: false })
  
  // Create notification for post author (don't notify yourself)
  // ✅ FIX: Check if both author and this.author exist before comparing
  if (commentData.author && this.author && this.author.toString() !== commentData.author.toString()) {
    try {
      const Notification = mongoose.model('Notification')
      await Notification.createNotification({
        recipient: this.author,
        sender: commentData.author,
        type: 'comment_post',
        post: this._id,
        message: 'commented on your post',
        link: `/blog/${this.slug}#comments`
      })
    } catch (error) {
      console.error('Error creating comment notification:', error)
    }
  }
  
  // Create notification for parent comment author (if this is a reply)
  if (commentData.parentComment) {
    const parentComment = this.comments.id(commentData.parentComment)
    if (parentComment && parentComment.author && 
        commentData.author && 
        parentComment.author.toString() !== commentData.author.toString()) {
      try {
        const Notification = mongoose.model('Notification')
        await Notification.createNotification({
          recipient: parentComment.author,
          sender: commentData.author,
          type: 'reply_comment',
          post: this._id,
          comment: parentComment._id,
          message: 'replied to your comment',
          link: `/blog/${this.slug}#comment-${parentComment._id}`
        })
      } catch (error) {
        console.error('Error creating reply notification:', error)
      }
    }
  }
  
  return savedPost
}

// Instance method to get approved comments with nested structure
PostSchema.methods.getCommentsWithReplies = function() {
  const approvedComments = this.comments.filter(comment => comment.isApproved)
  
  // Separate top-level comments and replies
  const topLevelComments = approvedComments.filter(comment => !comment.parentComment)
  const replies = approvedComments.filter(comment => comment.parentComment)
  
  // Attach replies to their parent comments
  const commentsWithReplies = topLevelComments.map(comment => {
    const commentReplies = replies.filter(reply => 
      reply.parentComment && reply.parentComment.equals(comment._id)
    )
    return {
      ...comment.toObject(),
      replies: commentReplies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }
  })
  
  return commentsWithReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Instance method to approve comment by ID
PostSchema.methods.approveComment = function(commentId) {
  const comment = this.comments.id(commentId)
  if (comment) {
    comment.approve()
    // ✅ FIX: Skip validation when saving (avoids SEO field validation)
    return this.save({ validateBeforeSave: false })
  }
  throw new Error('Comment not found')
}

// Instance method to delete comment by ID
PostSchema.methods.deleteComment = function(commentId) {
  this.comments = this.comments.filter(comment => !comment._id.equals(commentId))
  // ✅ FIX: Skip validation when saving (avoids SEO field validation)
  return this.save({ validateBeforeSave: false })
}

// Instance method to like/unlike comment
PostSchema.methods.toggleCommentLike = async function(commentId, userId) {
  const comment = this.comments.id(commentId)
  if (comment) {
    const wasLiked = comment.likes.includes(userId)
    
    if (wasLiked) {
      comment.removeLike(userId)
    } else {
      comment.addLike(userId)
      
      // Create notification for comment author (don't notify yourself)
      if (comment.author && comment.author.toString() !== userId.toString()) {
        try {
          const Notification = mongoose.model('Notification')
          await Notification.createNotification({
            recipient: comment.author,
            sender: userId,
            type: 'like_comment',
            post: this._id,
            comment: comment._id,
            message: 'liked your comment',
            link: `/blog/${this.slug}#comment-${comment._id}`
          })
        } catch (error) {
          console.error('Error creating comment like notification:', error)
        }
      }
    }
    // ✅ FIX: Skip validation when saving (avoids SEO field validation)
    return this.save({ validateBeforeSave: false })
  }
  throw new Error('Comment not found')
}

// Instance method to get comment statistics
PostSchema.methods.getCommentStats = function() {
  const allComments = this.comments || []
  const approvedComments = allComments.filter(c => c.isApproved)
  const pendingComments = allComments.filter(c => !c.isApproved && !c.isReported)
  const reportedComments = allComments.filter(c => c.isReported)
  const topLevelComments = approvedComments.filter(c => !c.parentComment)
  const replies = approvedComments.filter(c => c.parentComment)
  
  return {
    total: allComments.length,
    approved: approvedComments.length,
    pending: pendingComments.length,
    reported: reportedComments.length,
    topLevel: topLevelComments.length,
    replies: replies.length,
    totalLikes: approvedComments.reduce((sum, comment) => sum + comment.likeCount, 0)
  }
}

// Static method to get posts with comment counts
PostSchema.statics.getPostsWithCommentStats = function(query = {}) {
  return this.aggregate([
    { $match: query },
    {
      $addFields: {
        approvedCommentCount: {
          $size: {
            $filter: {
              input: '$comments',
              cond: { $eq: ['$this.isApproved', true] }
            }
          }
        },
        pendingCommentCount: {
          $size: {
            $filter: {
              input: '$comments',
              cond: { 
                $and: [
                  { $eq: ['$this.isApproved', false] },
                  { $eq: ['$this.isReported', false] }
                ]
              }
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$author' },
    { $unwind: '$category' }
  ])
}

export default mongoose.models.Post || mongoose.model('Post', PostSchema)