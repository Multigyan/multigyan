// lib/performance-monitor.js
// Performance monitoring and logging utility

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
  }

  /**
   * Start timing an operation
   * @param {string} operationName - Name of the operation
   * @returns {string} - Unique operation ID
   */
  start(operationName) {
    const operationId = `${operationName}-${Date.now()}-${Math.random()}`
    this.metrics.set(operationId, {
      name: operationName,
      startTime: Date.now(),
      startMemory: process.memoryUsage().heapUsed
    })
    return operationId
  }

  /**
   * End timing an operation and log results
   * @param {string} operationId - Operation ID from start()
   * @param {object} additionalData - Additional data to log
   */
  end(operationId, additionalData = {}) {
    const metric = this.metrics.get(operationId)
    
    if (!metric) {
      console.warn(`⚠️  Performance metric not found: ${operationId}`)
      return null
    }

    const endTime = Date.now()
    const endMemory = process.memoryUsage().heapUsed
    const duration = endTime - metric.startTime
    const memoryDelta = endMemory - metric.startMemory

    const result = {
      operation: metric.name,
      duration: `${duration}ms`,
      durationMs: duration,
      memoryUsed: this.formatBytes(memoryDelta),
      memoryUsedBytes: memoryDelta,
      timestamp: new Date().toISOString(),
      ...additionalData
    }

    // Log based on duration
    if (duration > 1000) {
      console.warn('⚠️  SLOW OPERATION:', result)
    } else if (duration > 500) {
      console.log('⏱️  Operation:', result)
    } else {
      console.log('✅ Fast operation:', result)
    }

    // Clean up
    this.metrics.delete(operationId)

    return result
  }

  /**
   * Measure a function execution time
   * @param {string} name - Operation name
   * @param {Function} fn - Function to measure
   * @returns {Promise<any>} - Function result
   */
  async measure(name, fn) {
    const operationId = this.start(name)
    
    try {
      const result = await fn()
      this.end(operationId, { status: 'success' })
      return result
    } catch (error) {
      this.end(operationId, { 
        status: 'error', 
        error: error.message 
      })
      throw error
    }
  }

  /**
   * Format bytes to human-readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
    const size = (bytes / Math.pow(k, i)).toFixed(2)
    
    return `${bytes < 0 ? '-' : ''}${size} ${sizes[i]}`
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    const usage = process.memoryUsage()
    
    return {
      rss: this.formatBytes(usage.rss),
      heapTotal: this.formatBytes(usage.heapTotal),
      heapUsed: this.formatBytes(usage.heapUsed),
      external: this.formatBytes(usage.external),
      arrayBuffers: this.formatBytes(usage.arrayBuffers)
    }
  }

  /**
   * Log system performance snapshot
   */
  logSnapshot() {
    const memory = this.getMemoryUsage()
    const uptime = process.uptime()
    
    console.log('\n📊 PERFORMANCE SNAPSHOT:')
    console.log('  Memory Usage:', memory)
    console.log('  Uptime:', `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`)
    console.log('  Active Metrics:', this.metrics.size)
    console.log('')
  }
}

// Export singleton instance
export const perfMonitor = new PerformanceMonitor()

/**
 * Middleware-style wrapper for API routes
 * Usage: export const GET = withPerformanceMonitoring('GET /api/posts', handler)
 */
export function withPerformanceMonitoring(operationName, handler) {
  return async (...args) => {
    const operationId = perfMonitor.start(operationName)
    
    try {
      const result = await handler(...args)
      perfMonitor.end(operationId, { status: 'success' })
      return result
    } catch (error) {
      perfMonitor.end(operationId, { 
        status: 'error', 
        error: error.message 
      })
      throw error
    }
  }
}

/**
 * Database query performance wrapper
 * Usage: const posts = await measureQuery('Find posts', () => Post.find().lean())
 */
export async function measureQuery(queryName, queryFn) {
  const operationId = perfMonitor.start(`DB Query: ${queryName}`)
  
  try {
    const result = await queryFn()
    const count = Array.isArray(result) ? result.length : 1
    perfMonitor.end(operationId, { 
      status: 'success',
      resultCount: count
    })
    return result
  } catch (error) {
    perfMonitor.end(operationId, { 
      status: 'error', 
      error: error.message 
    })
    throw error
  }
}

export default perfMonitor
