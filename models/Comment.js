import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null // For nested replies
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
CommentSchema.index({ post: 1, createdAt: -1 })
CommentSchema.index({ author: 1, createdAt: -1 })
CommentSchema.index({ parent: 1 })
CommentSchema.index({ status: 1 })

// Virtual for replies count
CommentSchema.virtual('repliesCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
  count: true
})

// Virtual for likes count
CommentSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0
})

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema)
