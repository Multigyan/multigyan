/**
 * Performance Monitor
 * 
 * Tracks and reports performance metrics for the admin panel
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = []
        this.maxMetrics = 1000
    }

    /**
     * Start timing an operation
     */
    startTiming(operationName) {
        return {
            name: operationName,
            startTime: performance.now(),
            startMemory: this.getMemoryUsage()
        }
    }

    /**
     * End timing and record metric
     */
    endTiming(timing) {
        const endTime = performance.now()
        const duration = endTime - timing.startTime
        const endMemory = this.getMemoryUsage()
        const memoryDelta = endMemory - timing.startMemory

        const metric = {
            name: timing.name,
            duration,
            memoryDelta,
            timestamp: Date.now()
        }

        this.addMetric(metric)
        return metric
    }

    /**
     * Add metric to collection
     */
    addMetric(metric) {
        this.metrics.push(metric)

        // Limit metrics size
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift()
        }
    }

    /**
     * Get memory usage (if available)
     */
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize
        }
        return 0
    }

    /**
     * Get average duration for operation
     */
    getAverageDuration(operationName) {
        const filtered = this.metrics.filter(m => m.name === operationName)
        if (filtered.length === 0) return 0

        const sum = filtered.reduce((acc, m) => acc + m.duration, 0)
        return sum / filtered.length
    }

    /**
     * Get all metrics for operation
     */
    getMetrics(operationName) {
        if (operationName) {
            return this.metrics.filter(m => m.name === operationName)
        }
        return [...this.metrics]
    }

    /**
     * Get performance summary
     */
    getSummary() {
        const operations = {}

        this.metrics.forEach(metric => {
            if (!operations[metric.name]) {
                operations[metric.name] = {
                    count: 0,
                    totalDuration: 0,
                    avgDuration: 0,
                    minDuration: Infinity,
                    maxDuration: -Infinity
                }
            }

            const op = operations[metric.name]
            op.count++
            op.totalDuration += metric.duration
            op.minDuration = Math.min(op.minDuration, metric.duration)
            op.maxDuration = Math.max(op.maxDuration, metric.duration)
            op.avgDuration = op.totalDuration / op.count
        })

        return operations
    }

    /**
     * Clear all metrics
     */
    clear() {
        this.metrics = []
    }

    /**
     * Export metrics as JSON
     */
    export() {
        return {
            metrics: this.metrics,
            summary: this.getSummary(),
            exportedAt: new Date().toISOString()
        }
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor()

export default performanceMonitor

/**
 * React hook for performance monitoring
 */
import { useCallback, useEffect } from 'react'

export function usePerformanceMonitor(operationName) {
    const measurePerformance = useCallback(async (fn) => {
        const timing = performanceMonitor.startTiming(operationName)

        try {
            const result = await fn()
            const metric = performanceMonitor.endTiming(timing)

            // Log slow operations (> 1 second)
            if (metric.duration > 1000) {
                console.warn(`Slow operation detected: ${operationName} took ${metric.duration.toFixed(2)}ms`)
            }

            return result
        } catch (error) {
            performanceMonitor.endTiming(timing)
            throw error
        }
    }, [operationName])

    return { measurePerformance }
}

/**
 * Hook for automatic page load performance tracking
 * Use this in your component: usePageLoadTracking('pageName')
 */
export function usePageLoadTracking(pageName) {
    useEffect(() => {
        if (typeof window === 'undefined') return

        const timing = performanceMonitor.startTiming(`page_load_${pageName}`)

        return () => {
            performanceMonitor.endTiming(timing)
        }
    }, [pageName])
}
