import mongoose from 'mongoose'

/**
 * DraftReview Model
 * 
 * Manages review requests for draft posts
 * Supports inline comments and overall feedback
 */

const DraftReviewSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },

    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'changes-requested', 'rejected'],
        default: 'pending',
        index: true
    },

    // Inline comments on specific parts of content
    comments: [{
        content: {
            type: String,
            required: true,
            maxlength: 1000
        },
        // Character position in content where comment applies
        position: {
            type: Number,
            default: 0
        },
        // Text selection that was commented on
        selectedText: {
            type: String,
            maxlength: 200
        },
        resolved: {
            type: Boolean,
            default: false
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: Date,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Overall review feedback
    overallFeedback: {
        type: String,
        maxlength: 2000
    },

    // Review completion timestamp
    reviewedAt: Date,

    // Notification status
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// Compound indexes for efficient queries
DraftReviewSchema.index({ post: 1, status: 1 })
DraftReviewSchema.index({ reviewer: 1, status: 1 })
DraftReviewSchema.index({ requestedBy: 1, createdAt: -1 })

// Virtual for unresolved comments count
DraftReviewSchema.virtual('unresolvedCommentsCount').get(function () {
    return this.comments.filter(c => !c.resolved).length
})

// Static method to request review
DraftReviewSchema.statics.requestReview = async function (postId, reviewerId, requestedById) {
    // Check if there's already a pending review
    const existingReview = await this.findOne({
        post: postId,
        reviewer: reviewerId,
        status: 'pending'
    })

    if (existingReview) {
        throw new Error('A pending review already exists for this reviewer')
    }

    const review = new this({
        post: postId,
        reviewer: reviewerId,
        requestedBy: requestedById
    })

    await review.save()
    return review
}

// Instance method to add comment
DraftReviewSchema.methods.addComment = function (content, position = 0, selectedText = '') {
    this.comments.push({
        content,
        position,
        selectedText,
        createdAt: new Date()
    })
    return this
}

// Instance method to resolve comment
DraftReviewSchema.methods.resolveComment = function (commentId, userId) {
    const comment = this.comments.id(commentId)
    if (comment) {
        comment.resolved = true
        comment.resolvedBy = userId
        comment.resolvedAt = new Date()
    }
    return this
}

// Instance method to complete review
DraftReviewSchema.methods.completeReview = function (status, feedback = '') {
    if (!['approved', 'changes-requested', 'rejected'].includes(status)) {
        throw new Error('Invalid review status')
    }

    this.status = status
    this.overallFeedback = feedback
    this.reviewedAt = new Date()
    return this
}

const DraftReview = mongoose.models.DraftReview || mongoose.model('DraftReview', DraftReviewSchema)

export default DraftReview
