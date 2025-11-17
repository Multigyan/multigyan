import mongoose from 'mongoose'

const NewsletterCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true,
    maxlength: [300, 'Subject cannot exceed 300 characters']
  },
  previewText: {
    type: String,
    trim: true,
    maxlength: [150, 'Preview text cannot exceed 150 characters'],
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Email content is required']
  },
  htmlContent: {
    type: String,
    required: [true, 'HTML content is required']
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Analytics
  analytics: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    sentCount: {
      type: Number,
      default: 0
    },
    failedCount: {
      type: Number,
      default: 0
    },
    openCount: {
      type: Number,
      default: 0
    },
    clickCount: {
      type: Number,
      default: 0
    },
    unsubscribeCount: {
      type: Number,
      default: 0
    },
    // Track individual email sends
    sentEmails: [{
      email: String,
      sentAt: Date,
      status: {
        type: String,
        enum: ['sent', 'failed', 'bounced']
      },
      errorMessage: String,
      opened: {
        type: Boolean,
        default: false
      },
      openedAt: Date,
      clicked: {
        type: Boolean,
        default: false
      },
      clickedAt: Date
    }]
  },
  // Targeting
  targetAudience: {
    type: String,
    enum: ['all', 'category', 'custom'],
    default: 'all'
  },
  targetCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  targetEmails: [String], // For custom targeting
  // A/B Testing
  abTest: {
    enabled: {
      type: Boolean,
      default: false
    },
    variants: [{
      name: String,
      subject: String,
      percentage: Number, // Percentage of audience to receive this variant
      sentCount: Number,
      openCount: Number,
      clickCount: Number
    }]
  },
  // Template
  template: {
    type: String,
    enum: ['basic', 'featured', 'digest', 'announcement', 'custom'],
    default: 'basic'
  },
  // Featured posts (for digest newsletters)
  featuredPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  // Settings
  settings: {
    trackOpens: {
      type: Boolean,
      default: true
    },
    trackClicks: {
      type: Boolean,
      default: true
    },
    allowUnsubscribe: {
      type: Boolean,
      default: true
    }
  },
  // Notes
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

// Indexes
NewsletterCampaignSchema.index({ status: 1, scheduledFor: 1 })
NewsletterCampaignSchema.index({ createdBy: 1, createdAt: -1 })
NewsletterCampaignSchema.index({ sentAt: -1 })

// Virtuals
NewsletterCampaignSchema.virtual('openRate').get(function() {
  if (this.analytics.sentCount === 0) return 0
  return ((this.analytics.openCount / this.analytics.sentCount) * 100).toFixed(2)
})

NewsletterCampaignSchema.virtual('clickRate').get(function() {
  if (this.analytics.sentCount === 0) return 0
  return ((this.analytics.clickCount / this.analytics.sentCount) * 100).toFixed(2)
})

NewsletterCampaignSchema.virtual('unsubscribeRate').get(function() {
  if (this.analytics.sentCount === 0) return 0
  return ((this.analytics.unsubscribeCount / this.analytics.sentCount) * 100).toFixed(2)
})

// Methods
NewsletterCampaignSchema.methods.markAsSent = function() {
  this.status = 'sent'
  this.sentAt = new Date()
  return this.save()
}

NewsletterCampaignSchema.methods.markAsFailed = function() {
  this.status = 'failed'
  return this.save()
}

NewsletterCampaignSchema.methods.recordOpen = function(email) {
  this.analytics.openCount += 1
  const emailRecord = this.analytics.sentEmails.find(e => e.email === email)
  if (emailRecord && !emailRecord.opened) {
    emailRecord.opened = true
    emailRecord.openedAt = new Date()
  }
  return this.save()
}

NewsletterCampaignSchema.methods.recordClick = function(email) {
  this.analytics.clickCount += 1
  const emailRecord = this.analytics.sentEmails.find(e => e.email === email)
  if (emailRecord && !emailRecord.clicked) {
    emailRecord.clicked = true
    emailRecord.clickedAt = new Date()
  }
  return this.save()
}

// Statics
NewsletterCampaignSchema.statics.getScheduledCampaigns = function() {
  return this.find({
    status: 'scheduled',
    scheduledFor: { $lte: new Date() }
  }).populate('createdBy', 'name email')
}

NewsletterCampaignSchema.statics.getCampaignStats = async function(campaignId) {
  const campaign = await this.findById(campaignId)
  if (!campaign) return null
  
  return {
    totalRecipients: campaign.analytics.totalRecipients,
    sentCount: campaign.analytics.sentCount,
    failedCount: campaign.analytics.failedCount,
    openCount: campaign.analytics.openCount,
    clickCount: campaign.analytics.clickCount,
    unsubscribeCount: campaign.analytics.unsubscribeCount,
    openRate: campaign.openRate,
    clickRate: campaign.clickRate,
    unsubscribeRate: campaign.unsubscribeRate
  }
}

// Ensure virtuals are serialized
NewsletterCampaignSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v
    return ret
  }
})

export default mongoose.models.NewsletterCampaign || mongoose.model('NewsletterCampaign', NewsletterCampaignSchema)
