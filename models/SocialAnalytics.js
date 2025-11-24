import mongoose from 'mongoose'

/**
 * SocialAnalytics Model
 * 
 * Track social media performance for posts
 * Monitor shares, engagement, and ROI
 */

const SocialAnalyticsSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },

    // Platform-specific analytics
    platforms: {
        twitter: {
            postUrl: String,
            postedAt: Date,
            likes: { type: Number, default: 0 },
            retweets: { type: Number, default: 0 },
            replies: { type: Number, default: 0 },
            impressions: { type: Number, default: 0 },
            engagementRate: { type: Number, default: 0 }
        },
        facebook: {
            postUrl: String,
            postedAt: Date,
            likes: { type: Number, default: 0 },
            shares: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            reach: { type: Number, default: 0 },
            engagementRate: { type: Number, default: 0 }
        },
        linkedin: {
            postUrl: String,
            postedAt: Date,
            likes: { type: Number, default: 0 },
            shares: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            impressions: { type: Number, default: 0 },
            engagementRate: { type: Number, default: 0 }
        },
        instagram: {
            postUrl: String,
            postedAt: Date,
            likes: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            saves: { type: Number, default: 0 },
            reach: { type: Number, default: 0 },
            engagementRate: { type: Number, default: 0 }
        }
    },

    // Aggregated metrics
    totalShares: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalReach: { type: Number, default: 0 },
    avgEngagementRate: { type: Number, default: 0 },

    // Hashtag performance
    hashtagPerformance: [{
        hashtag: String,
        impressions: Number,
        clicks: Number,
        engagement: Number
    }],

    // A/B testing
    variant: {
        type: String,
        enum: ['A', 'B'],
        default: 'A'
    },

    // ROI tracking
    roi: {
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
    },

    // Last sync
    lastSyncedAt: Date
}, {
    timestamps: true
})

// Indexes
SocialAnalyticsSchema.index({ post: 1, createdAt: -1 })
SocialAnalyticsSchema.index({ 'platforms.twitter.postedAt': -1 })
SocialAnalyticsSchema.index({ 'platforms.facebook.postedAt': -1 })

// Static method to update analytics
SocialAnalyticsSchema.statics.updatePlatformMetrics = async function (postId, platform, metrics) {
    let analytics = await this.findOne({ post: postId })

    if (!analytics) {
        analytics = new this({ post: postId })
    }

    // Update platform-specific metrics
    analytics.platforms[platform] = {
        ...analytics.platforms[platform],
        ...metrics
    }

    // Recalculate aggregated metrics
    analytics.totalShares =
        (analytics.platforms.twitter?.retweets || 0) +
        (analytics.platforms.facebook?.shares || 0) +
        (analytics.platforms.linkedin?.shares || 0)

    analytics.totalLikes =
        (analytics.platforms.twitter?.likes || 0) +
        (analytics.platforms.facebook?.likes || 0) +
        (analytics.platforms.linkedin?.likes || 0) +
        (analytics.platforms.instagram?.likes || 0)

    analytics.totalComments =
        (analytics.platforms.twitter?.replies || 0) +
        (analytics.platforms.facebook?.comments || 0) +
        (analytics.platforms.linkedin?.comments || 0) +
        (analytics.platforms.instagram?.comments || 0)

    analytics.totalReach =
        (analytics.platforms.twitter?.impressions || 0) +
        (analytics.platforms.facebook?.reach || 0) +
        (analytics.platforms.linkedin?.impressions || 0) +
        (analytics.platforms.instagram?.reach || 0)

    // Calculate average engagement rate
    const rates = [
        analytics.platforms.twitter?.engagementRate,
        analytics.platforms.facebook?.engagementRate,
        analytics.platforms.linkedin?.engagementRate,
        analytics.platforms.instagram?.engagementRate
    ].filter(rate => rate !== undefined && rate > 0)

    analytics.avgEngagementRate = rates.length > 0
        ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length
        : 0

    analytics.lastSyncedAt = new Date()

    await analytics.save()
    return analytics
}

const SocialAnalytics = mongoose.models.SocialAnalytics || mongoose.model('SocialAnalytics', SocialAnalyticsSchema)

export default SocialAnalytics
