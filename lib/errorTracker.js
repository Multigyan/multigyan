/**
 * Error Tracker
 * 
 * Centralized error tracking and reporting for the admin panel
 */

class ErrorTracker {
    constructor() {
        this.errors = []
        this.maxErrors = 500
        this.listeners = []
    }

    /**
     * Track an error
     */
    trackError(error, context = {}) {
        const errorEntry = {
            message: error.message || String(error),
            stack: error.stack,
            context,
            timestamp: Date.now(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown'
        }

        this.errors.push(errorEntry)

        // Limit errors size
        if (this.errors.length > this.maxErrors) {
            this.errors.shift()
        }

        // Notify listeners
        this.notifyListeners(errorEntry)

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error tracked:', errorEntry)
        }

        return errorEntry
    }

    /**
     * Add error listener
     */
    addListener(callback) {
        this.listeners.push(callback)
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback)
        }
    }

    /**
     * Notify all listeners
     */
    notifyListeners(error) {
        this.listeners.forEach(callback => {
            try {
                callback(error)
            } catch (err) {
                console.error('Error in error listener:', err)
            }
        })
    }

    /**
     * Get all errors
     */
    getAllErrors() {
        return [...this.errors]
    }

    /**
     * Get recent errors
     */
    getRecentErrors(limit = 50) {
        return this.errors.slice(-limit).reverse()
    }

    /**
     * Get errors by context
     */
    getErrorsByContext(contextKey, contextValue) {
        return this.errors.filter(error =>
            error.context[contextKey] === contextValue
        )
    }

    /**
     * Get error statistics
     */
    getStatistics() {
        const stats = {
            total: this.errors.length,
            byMessage: {},
            byContext: {},
            last24Hours: 0
        }

        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)

        this.errors.forEach(error => {
            // Count by message
            stats.byMessage[error.message] = (stats.byMessage[error.message] || 0) + 1

            // Count by context
            Object.keys(error.context).forEach(key => {
                const value = error.context[key]
                const contextKey = `${key}:${value}`
                stats.byContext[contextKey] = (stats.byContext[contextKey] || 0) + 1
            })

            // Count last 24 hours
            if (error.timestamp > oneDayAgo) {
                stats.last24Hours++
            }
        })

        return stats
    }

    /**
     * Clear all errors
     */
    clear() {
        this.errors = []
    }

    /**
     * Export errors as JSON
     */
    export() {
        return {
            errors: this.errors,
            statistics: this.getStatistics(),
            exportedAt: new Date().toISOString()
        }
    }

    /**
     * Send errors to server (optional)
     */
    async sendToServer(errors) {
        try {
            await fetch('/api/admin/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ errors })
            })
        } catch (error) {
            console.error('Failed to send errors to server:', error)
        }
    }
}

// Create singleton instance
const errorTracker = new ErrorTracker()

// Set up global error handler
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        errorTracker.trackError(event.error || new Error(event.message), {
            type: 'global',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        })
    })

    window.addEventListener('unhandledrejection', (event) => {
        errorTracker.trackError(event.reason || new Error('Unhandled promise rejection'), {
            type: 'unhandledRejection'
        })
    })
}

export default errorTracker

/**
 * React hook for error tracking
 */
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

export function useErrorTracking(context = {}) {
    const trackError = useCallback((error, additionalContext = {}) => {
        const errorEntry = errorTracker.trackError(error, {
            ...context,
            ...additionalContext
        })

        // Show toast notification
        toast.error(error.message || 'An error occurred', {
            description: 'This error has been logged'
        })

        return errorEntry
    }, [context])

    return { trackError }
}

/**
 * Error boundary helper
 */
export function logErrorBoundaryError(error, errorInfo) {
    errorTracker.trackError(error, {
        type: 'errorBoundary',
        componentStack: errorInfo.componentStack
    })
}
