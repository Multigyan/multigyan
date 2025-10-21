// lib/cache.js
// Simple in-memory cache for API responses

class SimpleCache {
  constructor() {
    this.cache = new Map()
  }

  set(key, value, ttl = 300) { // 5 minutes default
    const expiresAt = Date.now() + (ttl * 1000)
    this.cache.set(key, { value, expiresAt })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  keys() {
    return Array.from(this.cache.keys())
  }

  // Get all keys matching a pattern
  findKeys(pattern) {
    return this.keys().filter(key => key.includes(pattern))
  }
}

export const apiCache = new SimpleCache()

// ========================================
// CACHE INVALIDATION UTILITIES
// ========================================

// Invalidate all caches matching a pattern
export function invalidateCachePattern(pattern) {
  const keys = apiCache.keys()
  const matchingKeys = keys.filter(key => key.includes(pattern))
  
  matchingKeys.forEach(key => {
    apiCache.delete(key)
  })
  
  console.log(`🗑️  Invalidated ${matchingKeys.length} cache entries matching "${pattern}"`)
  return matchingKeys.length
}

// Invalidate all post-related caches
export function invalidatePostCaches() {
  invalidateCachePattern('posts-')
  invalidateCachePattern('public-stats')
  console.log('✅ Post caches invalidated')
}

// Invalidate all user-related caches
export function invalidateUserCaches() {
  invalidateCachePattern('authors-')
  invalidateCachePattern('public-stats')
  console.log('✅ User caches invalidated')
}

// Invalidate all category caches
export function invalidateCategoryCaches() {
  invalidateCachePattern('categories-')
  invalidateCachePattern('public-stats')
  console.log('✅ Category caches invalidated')
}
