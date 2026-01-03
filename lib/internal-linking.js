/**
 * Internal Linking System
 * Automatically suggests and manages internal links for SEO optimization
 */

import connectDB from './mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'

/**
 * Find related posts based on tags, category, and content similarity
 * @param {Object} post - Current post object
 * @param {number} limit - Maximum number of related posts to return
 * @returns {Promise<Array>} Array of related posts
 */
export async function findRelatedPosts(post, limit = 5) {
    try {
        await connectDB()

        const relatedPosts = []

        // 1. HIGHEST PRIORITY: Posts with shared tags (same topic)
        if (post.tags && post.tags.length > 0) {
            const tagMatches = await Post.find({
                status: 'published',
                _id: { $ne: post._id },
                tags: { $in: post.tags }
            })
                .select('title slug tags category excerpt readingTime publishedAt')
                .populate('category', 'name slug')
                .sort({ publishedAt: -1 })
                .limit(limit * 2) // Get extra for scoring
                .lean()

            // Score by number of matching tags
            tagMatches.forEach(p => {
                const matchingTags = p.tags.filter(t => post.tags.includes(t))
                relatedPosts.push({
                    ...p,
                    relevanceScore: matchingTags.length * 10, // High weight for tag matches
                    matchType: 'tags'
                })
            })
        }

        // 2. MEDIUM PRIORITY: Posts in same category
        if (post.category && relatedPosts.length < limit) {
            const categoryMatches = await Post.find({
                status: 'published',
                _id: { $ne: post._id },
                category: post.category._id || post.category,
                _id: { $nin: relatedPosts.map(p => p._id) } // Exclude already found
            })
                .select('title slug tags category excerpt readingTime publishedAt')
                .populate('category', 'name slug')
                .sort({ publishedAt: -1 })
                .limit(limit)
                .lean()

            categoryMatches.forEach(p => {
                relatedPosts.push({
                    ...p,
                    relevanceScore: 5, // Medium weight
                    matchType: 'category'
                })
            })
        }

        // 3. LOW PRIORITY: Posts by same author (already handled in page.js for "More from author")
        // Skip to avoid duplication

        // 4. KEYWORD SIMILARITY: Title and excerpt matching
        if (relatedPosts.length < limit && post.title) {
            const keywords = extractKeywords(post.title + ' ' + (post.excerpt || ''))

            if (keywords.length > 0) {
                const keywordMatches = await Post.find({
                    status: 'published',
                    _id: { $ne: post._id },
                    _id: { $nin: relatedPosts.map(p => p._id) },
                    $or: [
                        { title: { $regex: keywords.join('|'), $options: 'i' } },
                        { excerpt: { $regex: keywords.join('|'), $options: 'i' } }
                    ]
                })
                    .select('title slug tags category excerpt readingTime publishedAt')
                    .populate('category', 'name slug')
                    .sort({ publishedAt: -1 })
                    .limit(limit)
                    .lean()

                keywordMatches.forEach(p => {
                    relatedPosts.push({
                        ...p,
                        relevanceScore: 2, // Low weight
                        matchType: 'keywords'
                    })
                })
            }
        }

        // Sort by relevance score and recency, remove duplicates, return top results
        const uniquePosts = Array.from(
            new Map(relatedPosts.map(p => [p._id.toString(), p])).values()
        )

        return uniquePosts
            .sort((a, b) => {
                // Primary: Relevance score
                if (b.relevanceScore !== a.relevanceScore) {
                    return b.relevanceScore - a.relevanceScore
                }
                // Secondary: Recency
                return new Date(b.publishedAt) - new Date(a.publishedAt)
            })
            .slice(0, limit)

    } catch (error) {
        console.error('Error finding related posts:', error)
        return []
    }
}

/**
 * Extract keywords from text for matching
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} Array of keywords
 */
function extractKeywords(text) {
    if (!text) return []

    // Remove common stop words
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
        'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
        'who', 'when', 'where', 'why', 'how'
    ])

    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word))
        .slice(0, 10) // Top 10 keywords
}

/**
 * Generate internal link suggestions for a post's content
 * @param {string} content - HTML content of the post
 * @param {Array} relatedPosts - Array of related posts
 * @param {number} maxLinks - Maximum number of links to inject
 * @returns {Object} { content: string, linksAdded: number }
 */
export function injectInternalLinks(content, relatedPosts, maxLinks = 5) {
    if (!content || !relatedPosts || relatedPosts.length === 0) {
        return { content, linksAdded: 0 }
    }

    let modifiedContent = content
    let linksAdded = 0
    const wordCount = content.split(/\s+/).length

    // Don't over-link: max 1 link per 200 words
    const recommendedMaxLinks = Math.min(maxLinks, Math.floor(wordCount / 200))

    // Create linkable phrases from related posts
    const linkOpportunities = relatedPosts.map(post => ({
        post,
        phrases: generateLinkablePhrases(post)
    }))

    // Sort by relevance score
    linkOpportunities.sort((a, b) =>
        (b.post.relevanceScore || 0) - (a.post.relevanceScore || 0)
    )

    // Try to inject links
    for (const opportunity of linkOpportunities) {
        if (linksAdded >= recommendedMaxLinks) break

        const { post, phrases } = opportunity
        const postUrl = `/blog/${post.slug}`

        for (const phrase of phrases) {
            if (linksAdded >= recommendedMaxLinks) break

            // Create regex to find phrase (case-insensitive, not already linked)
            const regex = new RegExp(
                `(?<!<a[^>]*>)\\b(${escapeRegex(phrase)})\\b(?![^<]*</a>)`,
                'i'
            )

            const match = modifiedContent.match(regex)

            if (match) {
                // Replace first occurrence with link
                modifiedContent = modifiedContent.replace(
                    regex,
                    `<a href="${postUrl}" class="internal-link" title="${post.title}">$1</a>`
                )
                linksAdded++
                break // One link per post
            }
        }
    }

    return {
        content: modifiedContent,
        linksAdded
    }
}

/**
 * Generate linkable phrases from a post
 * @param {Object} post - Post object
 * @returns {Array<string>} Array of phrases to link
 */
function generateLinkablePhrases(post) {
    const phrases = []

    // Add title (full and partial)
    if (post.title) {
        phrases.push(post.title)

        // Add meaningful title fragments (3+ words)
        const titleWords = post.title.split(' ')
        if (titleWords.length >= 3) {
            for (let i = 0; i <= titleWords.length - 3; i++) {
                phrases.push(titleWords.slice(i, i + 3).join(' '))
            }
        }
    }

    // Add category name
    if (post.category?.name) {
        phrases.push(post.category.name)
    }

    // Add unique tags
    if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
            if (tag.length > 3) { // Only meaningful tags
                phrases.push(tag)
            }
        })
    }

    // Remove duplicates and sort by length (longer = more specific)
    return Array.from(new Set(phrases))
        .sort((a, b) => b.length - a.length)
        .slice(0, 5) // Top 5 most relevant phrases
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Get category archive link
 * @param {Object} category - Category object
 * @returns {string} Category URL
 */
export function getCategoryArchiveLink(category) {
    if (!category) return '/blog'
    return `/category/${category.slug || category._id}`
}

/**
 * Analyze internal linking for a post
 * @param {string} content - HTML content
 * @returns {Object} Analysis results
 */
export function analyzeInternalLinks(content) {
    if (!content) {
        return {
            totalLinks: 0,
            internalLinks: 0,
            externalLinks: 0,
            density: 0,
            recommendation: 'Add 3-5 internal links to related content'
        }
    }

    const linkRegex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>/gi
    const links = []
    let match

    while ((match = linkRegex.exec(content)) !== null) {
        links.push(match[1])
    }

    const internalLinks = links.filter(link =>
        link.startsWith('/') || link.includes(process.env.NEXT_PUBLIC_SITE_URL || 'multigyan.in')
    )
    const externalLinks = links.filter(link =>
        !link.startsWith('/') && !link.startsWith('#')
    )

    const wordCount = content.split(/\s+/).length
    const density = wordCount > 0 ? (internalLinks.length / wordCount) * 100 : 0

    let recommendation = 'Good internal linking'
    if (internalLinks.length < 3) {
        recommendation = 'Add more internal links (target: 3-5 per 1000 words)'
    } else if (density > 2) {
        recommendation = 'Too many internal links - reduce to avoid over-optimization'
    }

    return {
        totalLinks: links.length,
        internalLinks: internalLinks.length,
        externalLinks: externalLinks.length,
        density: density.toFixed(2),
        recommendation
    }
}

/**
 * Batch process: Add internal links to multiple posts
 * @param {Array<string>} postIds - Array of post IDs to process
 * @returns {Promise<Object>} Processing results
 */
export async function batchAddInternalLinks(postIds) {
    try {
        await connectDB()

        const results = {
            processed: 0,
            linksAdded: 0,
            errors: []
        }

        for (const postId of postIds) {
            try {
                const post = await Post.findById(postId)
                    .populate('category', 'name slug')
                    .populate('author', 'name username')

                if (!post || post.status !== 'published') continue

                // Find related posts
                const relatedPosts = await findRelatedPosts(post, 5)

                // Inject links
                const { content, linksAdded } = injectInternalLinks(
                    post.content,
                    relatedPosts,
                    5
                )

                if (linksAdded > 0) {
                    post.content = content
                    await post.save()
                    results.linksAdded += linksAdded
                }

                results.processed++

            } catch (error) {
                results.errors.push({ postId, error: error.message })
            }
        }

        return results

    } catch (error) {
        console.error('Batch internal linking error:', error)
        throw error
    }
}
