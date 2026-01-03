/**
 * Meta Description Templates & Generator
 * Generates compelling meta descriptions for different content types
 * Optimized for 125-155 characters for maximum SERP visibility
 */

/**
 * Generate meta description for News articles
 * Format: "Breaking: [Headline]. [Key Point]. Full analysis inside."
 */
export function generateNewsMetaDescription(post) {
    const title = post.title || ''
    const excerpt = post.excerpt || ''

    // Extract first sentence from excerpt as key point
    const keyPoint = excerpt.split('.')[0]?.trim() || excerpt.substring(0, 80)

    // Build description
    let description = `Breaking news: ${title}`

    // Add key point if space allows
    if (description.length + keyPoint.length + 20 < 155) {
        description += `.${keyPoint}.`
    }

    // Add call-to-action
    if (description.length < 140) {
        description += ' Full analysis.'
    }

    // Ensure proper length (125-155 chars)
    if (description.length > 155) {
        description = description.substring(0, 152) + '...'
    } else if (description.length < 125 && excerpt) {
        // Pad with more excerpt content
        const padding = excerpt.substring(keyPoint.length, 155 - description.length - 5)
        description += ` ${padding}...`
    }

    return description.trim()
}

/**
 * Generate meta description for Blog posts
 * Format: "[Topic]: [Benefit]. Learn [key learnings]. Read more."
 */
export function generateBlogMetaDescription(post) {
    const title = post.title || ''
    const excerpt = post.excerpt || ''
    const category = post.category?.name || 'topic'

    // Start with title or topic
    let description = title

    // Add benefit/value proposition from excerpt
    if (excerpt) {
        const benefit = excerpt.split('.')[0]?.trim()
        if (benefit && benefit.length < 100) {
            description = `${title}: ${benefit}.`
        }
    }

    // Add learning value
    if (description.length < 130) {
        description += ` Learn more about ${category.toLowerCase()}.`
    }

    // Ensure proper length
    if (description.length > 155) {
        description = description.substring(0, 152) + '...'
    } else if (description.length < 125 && excerpt) {
        const remaining = 152 - description.length
        description += ` ${excerpt.substring(0, remaining)}...`
    }

    return description.trim()
}

/**
 * Generate meta description for DIY tutorials
 * Format: "How to [Task] in [Time]. Step-by-step guide with materials list."
 */
export function generateDIYMetaDescription(post) {
    const title = post.title || ''
    const readingTime = post.readingTime || 5

    // Build DIY-specific description
    let description = title

    // Add time estimate
    if (!description.toLowerCase().includes('how to')) {
        description = `How to ${description.toLowerCase()} `
    }

    // Add project duration if available
    if (post.projectDuration) {
        description += ` in ${post.projectDuration}.`
    } else {
        description += ` - ${readingTime} min read.`
    }

    // Add value prop
    if (description.length < 120) {
        description += ' Step-by-step guide with materials list.'
    }

    // Ensure proper length
    if (description.length > 155) {
        description = description.substring(0, 152) + '...'
    }

    return description.trim()
}

/**
 * Generate meta description for Recipes
 * Format: "[Dish]: [Flavor profile]. Ready in [time]. Serves [X]."
 */
export function generateRecipeMetaDescription(post) {
    const title = post.title || ''
    const excerpt = post.excerpt || ''

    // Build recipe-specific description
    let description = title

    // Add flavor/description
    if (excerpt) {
        const flavor = excerpt.split('.')[0]?.trim()
        if (flavor && flavor.length < 50) {
            description += `: ${flavor}.`
        }
    }

    // Add cook time if available
    if (post.cookTime) {
        description += ` Ready in ${post.cookTime}.`
    }

    // Add servings if available
    if (post.servings) {
        description += ` Serves ${post.servings}.`
    }

    // Ensure proper length
    if (description.length > 155) {
        description = description.substring(0, 152) + '...'
    } else if (description.length < 125) {
        description += ' Easy recipe with ingredients list.'
    }

    return description.trim()
}

/**
 * Main function: Generate optimized meta description based on content type
 * @param {Object} post - Blog post object
 * @param {string} contentType - 'news' | 'blog' | 'diy' | 'recipe'
 * @returns {string} Optimized meta description (125-155 chars)
 */
export function generateMetaDescription(post, contentType = 'blog') {
    // If post already has a good SEO description, use it
    if (post.seoDescription && post.seoDescription.length >= 125 && post.seoDescription.length <= 155) {
        return post.seoDescription
    }

    // Generate based on content type
    switch (contentType) {
        case 'news':
            return generateNewsMetaDescription(post)
        case 'diy':
            return generateDIYMetaDescription(post)
        case 'recipe':
            return generateRecipeMetaDescription(post)
        case 'blog':
        default:
            return generateBlogMetaDescription(post)
    }
}

/**
 * Validate meta description quality
 * @param {string} description - Meta description to validate
 * @returns {Object} Validation result with score and suggestions
 */
export function validateMetaDescription(description) {
    const length = description?.length || 0
    const issues = []
    let score = 100

    // Length check
    if (length < 125) {
        issues.push('Too short - aim for 125-155 characters')
        score -= 30
    } else if (length > 155) {
        issues.push('Too long - will be truncated in search results')
        score -= 20
    }

    // Quality checks
    if (!description?.includes('.')) {
        issues.push('Add punctuation for better readability')
        score -= 10
    }

    // Power words check
    const powerWords = ['breaking', 'learn', 'discover', 'guide', 'how to', 'step-by-step', 'expert', 'complete']
    const hasPowerWord = powerWords.some(word => description?.toLowerCase().includes(word))
    if (!hasPowerWord) {
        issues.push('Consider adding action words like "Learn", "Discover", "Guide"')
        score -= 15
    }

    // Call-to-action check
    const hasCall = description?.toLowerCase().match(/(read|learn|discover|find|get|see) (more|how|out|details)/)
    if (!hasCall) {
        issues.push('Consider adding a call-to-action')
        score -= 10
    }

    return {
        isValid: score >= 70,
        score,
        issues,
        length,
        recommendation: score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs improvement'
    }
}
