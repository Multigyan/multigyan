import mongoose from 'mongoose'

/**
 * PostVersion Model
 * 
 * Tracks all versions of a post for history and rollback
 * Auto-created whenever a published post is edited
 */

const PostVersionSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },

    version: {
        type: Number,
        required: true
    },

    // Complete snapshot of post at this version
    snapshot: {
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
        contentType: String,

        // Recipe fields
        recipePrepTime: String,
        recipeCookTime: String,
        recipeServings: String,
        recipeIngredients: [String],
        recipeCuisine: String,
        recipeDiet: [String],

        // DIY fields
        diyDifficulty: String,
        diyMaterials: [String],
        diyTools: [String],
        diyEstimatedTime: String,

        // Other metadata
        allowComments: Boolean,
        lang: String,
        isFeatured: Boolean
    },

    // Change metadata
    editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    editReason: {
        type: String,
        maxlength: 500
    },

    changesSummary: {
        type: String,
        maxlength: 1000
    },

    // Diff data for quick comparison
    diff: {
        fieldsChanged: [String], // ['title', 'content', 'tags']
        addedTags: [String],
        removedTags: [String],
        contentLengthChange: Number, // Positive = added, negative = removed
    }
}, {
    timestamps: true
})

// Compound index for efficient version queries
PostVersionSchema.index({ post: 1, version: -1 })
PostVersionSchema.index({ post: 1, createdAt: -1 })
PostVersionSchema.index({ editedBy: 1, createdAt: -1 })

// Static method to create version from post
PostVersionSchema.statics.createVersion = async function (post, editedBy, editReason = '') {
    // Get latest version number
    const latestVersion = await this.findOne({ post: post._id })
        .sort({ version: -1 })
        .select('version')
        .lean()

    const newVersion = (latestVersion?.version || 0) + 1

    // Calculate diff
    const diff = {
        fieldsChanged: [],
        addedTags: [],
        removedTags: [],
        contentLengthChange: 0
    }

    // If there's a previous version, calculate diff
    if (latestVersion) {
        const previousSnapshot = await this.findOne({
            post: post._id,
            version: latestVersion.version
        }).select('snapshot').lean()

        if (previousSnapshot) {
            // Compare fields
            const fields = ['title', 'content', 'excerpt', 'featuredImageUrl', 'seoTitle', 'seoDescription']
            fields.forEach(field => {
                if (post[field] !== previousSnapshot.snapshot[field]) {
                    diff.fieldsChanged.push(field)
                }
            })

            // Compare tags
            const oldTags = previousSnapshot.snapshot.tags || []
            const newTags = post.tags || []
            diff.addedTags = newTags.filter(tag => !oldTags.includes(tag))
            diff.removedTags = oldTags.filter(tag => !newTags.includes(tag))

            // Content length change
            const oldLength = previousSnapshot.snapshot.content?.length || 0
            const newLength = post.content?.length || 0
            diff.contentLengthChange = newLength - oldLength
        }
    }

    // Auto-generate changes summary if not provided
    let changesSummary = editReason
    if (!changesSummary && diff.fieldsChanged.length > 0) {
        changesSummary = `Updated: ${diff.fieldsChanged.join(', ')}`
        if (diff.addedTags.length > 0) {
            changesSummary += ` | Added tags: ${diff.addedTags.join(', ')}`
        }
        if (diff.removedTags.length > 0) {
            changesSummary += ` | Removed tags: ${diff.removedTags.join(', ')}`
        }
    }

    // Create version
    const version = new this({
        post: post._id,
        version: newVersion,
        snapshot: {
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            featuredImageUrl: post.featuredImageUrl,
            featuredImageAlt: post.featuredImageAlt,
            category: post.category,
            tags: post.tags,
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
            seoKeywords: post.seoKeywords,
            contentType: post.contentType,
            recipePrepTime: post.recipePrepTime,
            recipeCookTime: post.recipeCookTime,
            recipeServings: post.recipeServings,
            recipeIngredients: post.recipeIngredients,
            recipeCuisine: post.recipeCuisine,
            recipeDiet: post.recipeDiet,
            diyDifficulty: post.diyDifficulty,
            diyMaterials: post.diyMaterials,
            diyTools: post.diyTools,
            diyEstimatedTime: post.diyEstimatedTime,
            allowComments: post.allowComments,
            lang: post.lang,
            isFeatured: post.isFeatured
        },
        editedBy,
        editReason,
        changesSummary,
        diff
    })

    await version.save()
    return version
}

// Static method to get version history
PostVersionSchema.statics.getHistory = function (postId, limit = 20, skip = 0) {
    return this.find({ post: postId })
        .sort({ version: -1 })
        .limit(limit)
        .skip(skip)
        .populate('editedBy', 'name email profilePictureUrl')
        .lean()
}

// Static method to restore version
PostVersionSchema.statics.restoreVersion = async function (postId, versionNumber) {
    const version = await this.findOne({
        post: postId,
        version: versionNumber
    }).lean()

    if (!version) {
        throw new Error('Version not found')
    }

    return version.snapshot
}

const PostVersion = mongoose.models.PostVersion || mongoose.model('PostVersion', PostVersionSchema)

export default PostVersion
