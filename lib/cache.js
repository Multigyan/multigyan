// lib/cache.js
// Simple in-memory cache (fallback if Redis not configured)

class SimpleCache {
  constructor() {
    this.cache = new Map()
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    })
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }
}

export const apiCache = new SimpleCache()

export function invalidatePostCaches() {
  // Clear all post-related caches
  console.log('🗑️  Invalidating post caches')
  // In production, this would clear specific patterns
  // For now, we'll just log it
}

export default apiCache
