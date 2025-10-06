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
}

export const apiCache = new SimpleCache()
