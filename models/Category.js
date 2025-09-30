import mongoose from 'mongoose'
import slugify from 'slugify'

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    maxlength: [50, 'Category name cannot be more than 50 characters'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters'],
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  postCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for better query performance
// Note: slug and name indexes are already created by unique: true in schema
CategorySchema.index({ isActive: 1 })

// Virtual for category URL
CategorySchema.virtual('url').get(function() {
  return `/category/${this.slug}`
})

// Generate slug before saving
CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    })
  }
  next()
})

// Static method to get active categories with post counts
CategorySchema.statics.getActiveWithCounts = function() {
  return this.find({ isActive: true })
    .sort({ postCount: -1, name: 1 })
    .select('name slug description color postCount')
}

// Static method to increment post count
CategorySchema.statics.incrementPostCount = function(categoryId) {
  return this.findByIdAndUpdate(
    categoryId,
    { $inc: { postCount: 1 } },
    { new: true }
  )
}

// Static method to decrement post count
CategorySchema.statics.decrementPostCount = function(categoryId) {
  return this.findByIdAndUpdate(
    categoryId,
    { $inc: { postCount: -1 } },
    { new: true }
  )
}

export default mongoose.models.Category || mongoose.model('Category', CategorySchema)