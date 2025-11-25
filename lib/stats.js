import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import Category from '@/models/Category'

/**
 * ✅ CENTRALIZED STATS SERVICE
 * Single source of truth for all statistics across the entire website
 * Use this in ALL pages to ensure data consistency
 */

// Cache for stats (in-memory, resets on server restart)
let statsCache = null
let lastCacheTime = 0
const CACHE_DURATION = 60000 // 60 seconds (1 minute)

/**
 * Get unified stats for the entire website
 * @returns {Promise<Object>} Complete stats object
 */
export async function getUnifiedStats() {
    // Return cached data if still valid
    const now = Date.now()
    if (statsCache && (now - lastCacheTime) < CACHE_DURATION) {
        return statsCache
    }

    await connectDB()

    // ✅ CRITICAL: Get ONLY published posts with populated references
    const publishedPosts = await Post.find({ status: 'published' })
        .select('author category views likes publishedAt contentType')
        .populate('author', '_id name username')
        .populate('category', '_id name slug')
        .lean()

    // Filter valid posts (have both author and category)
    const validPosts = publishedPosts.filter(post =>
        post.author && post.category
    )

    // Calculate global stats
    const stats = {
        totalPosts: validPosts.length,
        totalViews: validPosts.reduce((sum, post) => sum + (post.views || 0), 0),
        totalLikes: validPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0),
        activeAuthors: 0,
        activeCategories: 0,
        avgPostsPerAuthor: 0,
        avgPostsPerCategory: 0
    }

    // Group by author
    const authorStatsMap = {}
    validPosts.forEach(post => {
        const authorId = post.author._id.toString()
        if (!authorStatsMap[authorId]) {
            authorStatsMap[authorId] = {
                authorId,
                name: post.author.name,
                username: post.author.username,
                postCount: 0,
                totalViews: 0,
                totalLikes: 0,
                latestPost: null
            }
        }
        authorStatsMap[authorId].postCount++
        authorStatsMap[authorId].totalViews += post.views || 0
        authorStatsMap[authorId].totalLikes += post.likes?.length || 0
        if (!authorStatsMap[authorId].latestPost || post.publishedAt > authorStatsMap[authorId].latestPost) {
            authorStatsMap[authorId].latestPost = post.publishedAt
        }
    })

    // Group by category
    const categoryStatsMap = {}
    validPosts.forEach(post => {
        const categoryId = post.category._id.toString()
        if (!categoryStatsMap[categoryId]) {
            categoryStatsMap[categoryId] = {
                categoryId,
                name: post.category.name,
                slug: post.category.slug,
                postCount: 0,
                totalViews: 0,
                totalLikes: 0,
                latestPost: null
            }
        }
        categoryStatsMap[categoryId].postCount++
        categoryStatsMap[categoryId].totalViews += post.views || 0
        categoryStatsMap[categoryId].totalLikes += post.likes?.length || 0
        if (!categoryStatsMap[categoryId].latestPost || post.publishedAt > categoryStatsMap[categoryId].latestPost) {
            categoryStatsMap[categoryId].latestPost = post.publishedAt
        }
    })

    stats.activeAuthors = Object.keys(authorStatsMap).length
    stats.activeCategories = Object.keys(categoryStatsMap).length
    stats.avgPostsPerAuthor = stats.activeAuthors > 0 ? Math.round(stats.totalPosts / stats.activeAuthors) : 0
    stats.avgPostsPerCategory = stats.activeCategories > 0 ? Math.round(stats.totalPosts / stats.activeCategories) : 0

    // Data integrity check
    const dataIntegrity = {
        totalPublishedPosts: publishedPosts.length,
        validPosts: validPosts.length,
        postsWithoutAuthor: publishedPosts.filter(p => !p.author).length,
        postsWithoutCategory: publishedPosts.filter(p => !p.category).length,
        hasIssues: publishedPosts.length !== validPosts.length
    }

    const result = {
        stats,
        authorStats: authorStatsMap,
        categoryStats: categoryStatsMap,
        dataIntegrity,
        cachedAt: new Date().toISOString()
    }

    // Update cache
    statsCache = result
    lastCacheTime = now

    return result
}

/**
 * Get stats for a specific author
 * @param {string} authorId - Author ID or username
 * @returns {Promise<Object>} Author stats
 */
export async function getAuthorStats(authorId) {
    const { authorStats } = await getUnifiedStats()

    // Try to find by ID first, then by username
    let stats = authorStats[authorId]
    if (!stats) {
        stats = Object.values(authorStats).find(s => s.username === authorId)
    }

    return stats || null
}

/**
 * Get stats for a specific category
 * @param {string} categoryId - Category ID or slug
 * @returns {Promise<Object>} Category stats
 */
export async function getCategoryStats(categoryId) {
    const { categoryStats } = await getUnifiedStats()

    // Try to find by ID first, then by slug
    let stats = categoryStats[categoryId]
    if (!stats) {
        stats = Object.values(categoryStats).find(s => s.slug === categoryId)
    }

    return stats || null
}

/**
 * Clear the stats cache (useful after creating/updating/deleting posts)
 */
export function clearStatsCache() {
    statsCache = null
    lastCacheTime = 0
}
