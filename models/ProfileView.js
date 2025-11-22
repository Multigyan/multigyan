import mongoose from 'mongoose'

const ProfileViewSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    // Enhanced tracking fields
    referrer: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    viewerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },
    sessionId: {
        type: String,
        default: null
    },
    // Time tracking
    timeOnProfile: {
        type: Number, // seconds
        default: 0
    },
    sectionsViewed: [{
        section: String,
        timestamp: Date
    }],
    // Conversion tracking
    followedAfterView: {
        type: Boolean,
        default: false
    },
    followedAt: {
        type: Date,
        default: null
    },
    // Device info
    deviceType: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'unknown'],
        default: 'unknown'
    },
    browser: {
        type: String,
        default: null
    },
    os: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

// Indexes for efficient queries
ProfileViewSchema.index({ profileId: 1, timestamp: -1 })
ProfileViewSchema.index({ username: 1, timestamp: -1 })
ProfileViewSchema.index({ viewerUserId: 1, timestamp: -1 })
ProfileViewSchema.index({ timestamp: -1 })

// Static method to get view count
ProfileViewSchema.statics.getViewCount = async function (profileId, startDate, endDate) {
    const query = { profileId }

    if (startDate || endDate) {
        query.timestamp = {}
        if (startDate) query.timestamp.$gte = startDate
        if (endDate) query.timestamp.$lte = endDate
    }

    return await this.countDocuments(query)
}

// Static method to get unique viewers
ProfileViewSchema.statics.getUniqueViewers = async function (profileId, startDate, endDate) {
    const query = { profileId, viewerUserId: { $ne: null } }

    if (startDate || endDate) {
        query.timestamp = {}
        if (startDate) query.timestamp.$gte = startDate
        if (endDate) query.timestamp.$lte = endDate
    }

    const viewers = await this.distinct('viewerUserId', query)
    return viewers.length
}

// Static method to get conversion rate
ProfileViewSchema.statics.getConversionRate = async function (profileId) {
    const [totalViews, conversions] = await Promise.all([
        this.countDocuments({ profileId }),
        this.countDocuments({ profileId, followedAfterView: true })
    ])

    return totalViews > 0 ? (conversions / totalViews) * 100 : 0
}

export default mongoose.models.ProfileView || mongoose.model('ProfileView', ProfileViewSchema)
