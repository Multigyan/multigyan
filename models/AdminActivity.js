import mongoose from 'mongoose'

/**
 * Admin Activity Log Schema
 * 
 * Tracks all admin actions for audit trail and analytics
 */
const adminActivitySchema = new mongoose.Schema({
    // Admin who performed the action
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Action type
    action: {
        type: String,
        required: true,
        enum: [
            // User management
            'user_promote', 'user_demote', 'user_activate', 'user_deactivate',
            // Content moderation
            'post_approve', 'post_reject', 'post_delete', 'post_bulk_approve', 'post_bulk_reject', 'post_bulk_delete',
            // Revision management
            'revision_approve', 'revision_reject',
            // Comment moderation
            'comment_approve', 'comment_reject', 'comment_delete', 'comment_bulk_delete',
            // Category management
            'category_create', 'category_update', 'category_delete',
            // System actions
            'settings_update', 'export_data'
        ],
        index: true
    },

    // Target resource
    targetType: {
        type: String,
        enum: ['user', 'post', 'comment', 'category', 'revision', 'settings', 'system'],
        index: true
    },

    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },

    // Action details
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Metadata
    metadata: {
        ipAddress: String,
        userAgent: String,
        duration: Number, // milliseconds
        success: {
            type: Boolean,
            default: true
        },
        errorMessage: String
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
})

// Indexes for efficient querying
adminActivitySchema.index({ admin: 1, createdAt: -1 })
adminActivitySchema.index({ action: 1, createdAt: -1 })
adminActivitySchema.index({ targetType: 1, targetId: 1 })
adminActivitySchema.index({ createdAt: -1 })

// Static methods
adminActivitySchema.statics.logActivity = async function (data) {
    try {
        return await this.create(data)
    } catch (error) {
        // Silent fail - admin activity logging is non-critical
        // Don't break the main operation if logging fails
        return null
    }
}

adminActivitySchema.statics.getRecentActivity = async function (limit = 50) {
    return await this.find()
        .populate('admin', 'name email profilePictureUrl')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
}

adminActivitySchema.statics.getActivityByAdmin = async function (adminId, limit = 50) {
    return await this.find({ admin: adminId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
}

adminActivitySchema.statics.getActivityStats = async function (days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const stats = await this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ])

    return stats
}

export default mongoose.models.AdminActivity || mongoose.model('AdminActivity', adminActivitySchema)
