// lib/redis-cache.js
// Upstash Redis cache for better performance and scalability
// This replaces in-memory cache with persistent Redis

import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
// Get your credentials from: https://console.upstash.com/
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

class RedisCache {
  constructor() {
    this.enabled = redis !== null
    
    if (!this.enabled) {
      console.warn('⚠️  Redis cache disabled - Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local')
      console.warn('⚠️  Falling back to in-memory cache')
    } else {
      console.debug('✅ Redis cache enabled')
    }
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set(key, value, ttl = 300) {
    if (!this.enabled) {
      return null
    }

    try {
      // Store as JSON string
      await redis.setex(key, ttl, JSON.stringify(value))
      console.debug(`✅ Redis SET: ${key} (TTL: ${ttl}s)`)
      return true
    } catch (error) {
      console.error('❌ Redis SET error:', error)
      return null
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Parsed value or null
   */
  async get(key) {
    if (!this.enabled) {
      return null
    }

    try {
      const value = await redis.get(key)
      
      if (value === null) {
        console.debug(`❌ Redis MISS: ${key}`)
        return null
      }
      
      console.debug(`✅ Redis HIT: ${key}`)
      return typeof value === 'string' ? JSON.parse(value) : value
    } catch (error) {
      console.error('❌ Redis GET error:', error)
      return null
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  async delete(key) {
    if (!this.enabled) {
      return null
    }

    try {
      await redis.del(key)
      console.debug(`✅ Redis DELETE: ${key}`)
      return true
    } catch (error) {
      console.error('❌ Redis DELETE error:', error)
      return null
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., "posts-*")
   */
  async deletePattern(pattern) {
    if (!this.enabled) {
      return 0
    }

    try {
      // Scan for keys matching pattern
      const keys = []
      let cursor = 0

      do {
        const result = await redis.scan(cursor, { match: pattern, count: 100 })
        cursor = result[0]
        keys.push(...result[1])
      } while (cursor !== 0)

      if (keys.length === 0) {
        console.debug(`⚠️  No keys found matching pattern: ${pattern}`)
        return 0
      }

      // Delete all matching keys
      await redis.del(...keys)
      console.debug(`✅ Redis DELETE PATTERN: ${pattern} (${keys.length} keys)`)
      return keys.length
    } catch (error) {
      console.error('❌ Redis DELETE PATTERN error:', error)
      return 0
    }
  }

  /**
   * Check if cache is enabled
   */
  isEnabled() {
    return this.enabled
  }

  /**
   * Get cache statistics (Upstash specific)
   */
  async getStats() {
    if (!this.enabled) {
      return { enabled: false }
    }

    try {
      const info = await redis.info()
      return {
        enabled: true,
        info
      }
    } catch (error) {
      console.error('❌ Redis STATS error:', error)
      return { enabled: true, error: error.message }
    }
  }

  /**
   * Flush all keys (use with caution!)
   */
  async flush() {
    if (!this.enabled) {
      return false
    }

    try {
      await redis.flushdb()
      console.debug('✅ Redis FLUSH: All keys deleted')
      return true
    } catch (error) {
      console.error('❌ Redis FLUSH error:', error)
      return false
    }
  }

  /**
   * Increment a counter
   * @param {string} key - Counter key
   * @param {number} amount - Amount to increment (default: 1)
   */
  async increment(key, amount = 1) {
    if (!this.enabled) {
      return null
    }

    try {
      const result = await redis.incrby(key, amount)
      console.debug(`✅ Redis INCREMENT: ${key} by ${amount} = ${result}`)
      return result
    } catch (error) {
      console.error('❌ Redis INCREMENT error:', error)
      return null
    }
  }

  /**
   * Set with NX option (only if key doesn't exist)
   * Useful for rate limiting
   */
  async setNX(key, value, ttl = 300) {
    if (!this.enabled) {
      return null
    }

    try {
      const result = await redis.set(key, JSON.stringify(value), {
        nx: true,
        ex: ttl
      })
      
      if (result === 'OK') {
        console.debug(`✅ Redis SETNX: ${key} (TTL: ${ttl}s)`)
        return true
      }
      
      console.debug(`❌ Redis SETNX FAILED: ${key} already exists`)
      return false
    } catch (error) {
      console.error('❌ Redis SETNX error:', error)
      return null
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCache()

// ========================================
// CACHE INVALIDATION UTILITIES
// ========================================

/**
 * Invalidate all caches matching a pattern
 */
export async function invalidateCachePattern(pattern) {
  const count = await redisCache.deletePattern(`${pattern}*`)
  console.debug(`🗑️  Invalidated ${count} cache entries matching "${pattern}"`)
  return count
}

/**
 * Invalidate all post-related caches
 */
export async function invalidatePostCaches() {
  await Promise.all([
    invalidateCachePattern('posts-'),
    invalidateCachePattern('public-stats'),
    invalidateCachePattern('featured-posts'),
    invalidateCachePattern('recent-posts')
  ])
  console.debug('✅ Post caches invalidated')
}

/**
 * Invalidate all user-related caches
 */
export async function invalidateUserCaches() {
  await Promise.all([
    invalidateCachePattern('authors-'),
    invalidateCachePattern('public-stats')
  ])
  console.debug('✅ User caches invalidated')
}

/**
 * Invalidate all category caches
 */
export async function invalidateCategoryCaches() {
  await Promise.all([
    invalidateCachePattern('categories-'),
    invalidateCachePattern('public-stats')
  ])
  console.debug('✅ Category caches invalidated')
}

/**
 * Cache wrapper with automatic invalidation
 * Usage: const data = await cacheWrapper('key', async () => fetchData(), 300)
 */
export async function cacheWrapper(key, fetchFn, ttl = 300) {
  // Try to get from cache first
  const cached = await redisCache.get(key)
  if (cached !== null) {
    return cached
  }

  // Cache miss - fetch data
  const data = await fetchFn()
  
  // Store in cache
  await redisCache.set(key, data, ttl)
  
  return data
}

export default redisCache
