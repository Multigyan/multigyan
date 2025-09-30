import mongoose from 'mongoose'

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
      },
      message: 'Please enter a valid email address'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    enum: ['website', 'footer', 'popup', 'manual', 'import'],
    default: 'website'
  },
  preferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }]
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  }
}, {
  timestamps: true
})

// Indexes
// Note: email index is already created by unique: true in schema
NewsletterSchema.index({ isActive: 1 })
NewsletterSchema.index({ subscribedAt: -1 })

// Instance methods
NewsletterSchema.methods.unsubscribe = function() {
  this.isActive = false
  this.unsubscribedAt = new Date()
  return this.save()
}

NewsletterSchema.methods.resubscribe = function() {
  this.isActive = true
  this.unsubscribedAt = null
  return this.save()
}

// Static methods
NewsletterSchema.statics.getActiveSubscribers = function() {
  return this.find({ isActive: true }).sort({ subscribedAt: -1 })
}

NewsletterSchema.statics.getSubscribersByCategory = function(categoryId) {
  return this.find({ 
    isActive: true,
    'preferences.categories': categoryId 
  })
}

NewsletterSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
      }
    }
  ])
}

// Virtual for subscription status
NewsletterSchema.virtual('status').get(function() {
  return this.isActive ? 'active' : 'unsubscribed'
})

// Ensure virtual fields are serialized
NewsletterSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id
    delete ret.__v
    return ret
  }
})

export default mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema)
