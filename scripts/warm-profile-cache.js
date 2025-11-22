#!/usr/bin/env node

/**
 * Cache Warming Script for Profile Pages
 * 
 * This script pre-caches profile stats for the most popular users
 * to ensure instant load times for frequently visited profiles.
 * 
 * Usage:
 *   node scripts/warm-profile-cache.js
 * 
 * Schedule with cron:
 *   0 * * * * node /path/to/scripts/warm-profile-cache.js
 */

import { connectDB } from '../lib/mongodb.js'
import { redisCache } from '../lib/redis-cache.js'
import User from '../models/User.js'
import Post from '../models/Post.js'

async function warmProfileCache() {
    try {
        console.log('🔥 Starting cache warming...')
        await connectDB()

        // Get top 100 users by followers
        const popularUsers = await User.find({ isActive: true })
            .sort({ 'followers': -1 })
            .limit(100)
            .select('_id username name followers')
            .lean()

        console.log(`📊 Found ${popularUsers.length} popular users to cache`)

        let cached = 0
        for (const user of popularUsers) {
            try {
                // Calculate stats
                const publishedPosts = await Post.find({
                    author: user._id,
                    status: 'published'
                }).select('views likes').lean()

                const totalViews = publishedPosts.reduce((sum, post) => sum + (post.views || 0), 0)
                const totalLikes = publishedPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)

                const stats = {
                    totalPosts: publishedPosts.length,
                    totalViews,
                    totalLikes,
                    followersCount: user.followers?.length || 0,
                    followingCount: 0 // Not needed for cache warming
                }

                // Cache for 5 minutes
                await redisCache.set(`profile-stats-${user._id}`, stats, 300)
                cached++

                console.log(`✅ Cached stats for ${user.username} (${cached}/${popularUsers.length})`)
            } catch (error) {
                console.error(`❌ Failed to cache ${user.username}:`, error.message)
            }
        }

        console.log(`\n🎉 Cache warming complete! Cached ${cached} profiles`)
        process.exit(0)
    } catch (error) {
        console.error('❌ Cache warming failed:', error)
        process.exit(1)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    warmProfileCache()
}

export default warmProfileCache
