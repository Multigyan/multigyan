import mongoose from 'mongoose'

/**
 * PostAnalytics Model
 * 
 * Tracks detailed analytics for posts
 * Daily snapshots for historical tracking
 */

const PostAnalyticsSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },

    date: {
        type: Date,
        required: true,
        index: true
    },

    // View metrics
    views: {
        total: { type: Number, default: 0 },
        unique: { type: Number, default: 0 }
    },

    // Engagement metrics
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // Reading metrics
    avgReadTime: { type: Number, default: 0 }, // in seconds
    bounceRate: { type: Number, default: 0 }, // percentage

    // Traffic sources
    sources: {
        direct: { type: Number, default: 0 },
        search: { type: Number, default: 0 },
        social: { type: Number, default: 0 },
        referral: { type: Number, default: 0 }
    },

    // Device breakdown
    devices: {
        desktop: { type: Number, default: 0 },
        mobile: { type: Number, default: 0 },
        tablet: { type: Number, default: 0 }
    },

    // Geographic data (optional)
    topCountries: [{
        country: String,
        views: Number
    }],

    // SEO metrics
    seoScore: { type: Number, default: 0 },
    searchImpressions: { type: Number, default: 0 },
    searchClicks: { type: Number, default: 0 },
    avgPosition: { type: Number, default: 0 }
}, {
    timestamps: true
})

// Compound indexes for efficient queries
PostAnalyticsSchema.index({ post: 1, date: -1 })
PostAnalyticsSchema.index({ date: -1 })

// Static method to record view
PostAnalyticsSchema.statics.recordView = async function (postId, data = {}) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const {
        isUnique = false,
        source = 'direct',
        device = 'desktop',
        readTime = 0
    } = data

    // Find or create today's analytics
    let analytics = await this.findOne({ post: postId, date: today })

    if (!analytics) {
        analytics = new this({
            post: postId,
            date: today
        })
    }

    // Update metrics
    analytics.views.total += 1
    if (isUnique) {
        analytics.views.unique += 1
    }

    // Update source
    if (analytics.sources[source] !== undefined) {
        analytics.sources[source] += 1
    }

    // Update device
    if (analytics.devices[device] !== undefined) {
        analytics.devices[device] += 1
    }

    // Update average read time
    if (readTime > 0) {
        const totalReadTime = analytics.avgReadTime * (analytics.views.total - 1)
        analytics.avgReadTime = (totalReadTime + readTime) / analytics.views.total
    }

    await analytics.save()
    return analytics
}

// Static method to get analytics summary
PostAnalyticsSchema.statics.getSummary = async function (postId, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const analytics = await this.find({
        post: postId,
        date: { $gte: startDate }
    }).sort({ date: 1 }).lean()

    // Calculate totals
    const summary = {
        totalViews: 0,
        uniqueViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        avgReadTime: 0,
        avgBounceRate: 0,
        sources: { direct: 0, search: 0, social: 0, referral: 0 },
        devices: { desktop: 0, mobile: 0, tablet: 0 },
        dailyData: analytics
    }

    analytics.forEach(day => {
        summary.totalViews += day.views.total
        summary.uniqueViews += day.views.unique
        summary.totalLikes += day.likes
        summary.totalComments += day.comments
        summary.totalShares += day.shares
        summary.avgReadTime += day.avgReadTime
        summary.avgBounceRate += day.bounceRate

        Object.keys(day.sources).forEach(source => {
            summary.sources[source] += day.sources[source]
        })

        Object.keys(day.devices).forEach(device => {
            summary.devices[device] += day.devices[device]
        })
    })

    // Calculate averages
    if (analytics.length > 0) {
        summary.avgReadTime = summary.avgReadTime / analytics.length
        summary.avgBounceRate = summary.avgBounceRate / analytics.length
    }

    return summary
}

// Static method to get top posts
PostAnalyticsSchema.statics.getTopPosts = async function (days = 30, limit = 10) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const topPosts = await this.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
            $group: {
                _id: '$post',
                totalViews: { $sum: '$views.total' },
                uniqueViews: { $sum: '$views.unique' },
                totalLikes: { $sum: '$likes' },
                totalComments: { $sum: '$comments' },
                avgReadTime: { $avg: '$avgReadTime' }
            }
        },
        { $sort: { totalViews: -1 } },
        { $limit: limit }
    ])

    // Populate post details
    await this.populate(topPosts, {
        path: '_id',
        select: 'title slug featuredImageUrl author category',
        populate: [
            { path: 'author', select: 'name' },
            { path: 'category', select: 'name' }
        ]
    })

    return topPosts.map(item => ({
        post: item._id,
        metrics: {
            totalViews: item.totalViews,
            uniqueViews: item.uniqueViews,
            totalLikes: item.totalLikes,
            totalComments: item.totalComments,
            avgReadTime: item.avgReadTime
        }
    }))
}

const PostAnalytics = mongoose.models.PostAnalytics || mongoose.model('PostAnalytics', PostAnalyticsSchema)

export default PostAnalytics
