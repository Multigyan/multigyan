/**
 * Rate Limiting Utility
 * 
 * Provides rate limiting for API routes to prevent abuse and control costs.
 * Uses in-memory storage for simplicity (can be upgraded to Redis for production).
 * 
 * Usage:
 * import { rateLimit } from '@/lib/ratelimit'
 * 
 * export async function POST(request) {
 *   const rateLimitResult = await rateLimit(request, { max: 10, window: '1m' })
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 *   }
 *   // ... rest of handler
 * }
 */

import { NextResponse } from 'next/server'

// In-memory store for rate limiting
// Note: This resets on server restart. For production, consider Redis.
const rateLimitStore = new Map()

/**
 * Parse time window string to milliseconds
 * Examples: '1m' = 60000ms, '1h' = 3600000ms, '1d' = 86400000ms
 */
function parseWindow(window) {
    const match = window.match(/^(\d+)([smhd])$/)
    if (!match) throw new Error(`Invalid window format: ${window}`)

    const value = parseInt(match[1])
    const unit = match[2]

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    }

    return value * multipliers[unit]
}

/**
 * Get client identifier from request
 */
function getClientId(request) {
    // Try to get IP from headers (works on Vercel)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    return forwarded?.split(',')[0] || realIp || 'anonymous'
}

/**
 * Clean up expired entries from store
 */
function cleanupStore() {
    const now = Date.now()
    for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

/**
 * Rate limit a request
 * 
 * @param {Request} request - The incoming request
 * @param {Object} options - Rate limit options
 * @param {number} options.max - Maximum requests allowed in window
 * @param {string} options.window - Time window (e.g., '1m', '1h')
 * @param {string} options.prefix - Optional prefix for the rate limit key
 * @returns {Object} { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function rateLimit(request, options = {}) {
    const { max = 10, window = '1m', prefix = '' } = options

    const clientId = getClientId(request)
    const windowMs = parseWindow(window)
    const key = `${prefix}:${clientId}`

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
        cleanupStore()
    }

    const now = Date.now()
    const data = rateLimitStore.get(key)

    if (!data || now > data.resetTime) {
        // First request or window expired
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        })

        return {
            success: true,
            limit: max,
            remaining: max - 1,
            reset: now + windowMs,
        }
    }

    // Increment count
    data.count++

    if (data.count > max) {
        return {
            success: false,
            limit: max,
            remaining: 0,
            reset: data.resetTime,
        }
    }

    return {
        success: true,
        limit: max,
        remaining: max - data.count,
        reset: data.resetTime,
    }
}

/**
 * Rate limit middleware for auth endpoints
 * 5 requests per 15 minutes
 */
export async function authRateLimit(request) {
    return rateLimit(request, { max: 5, window: '15m', prefix: 'auth' })
}

/**
 * Rate limit middleware for comment endpoints
 * 10 requests per minute
 */
export async function commentRateLimit(request) {
    return rateLimit(request, { max: 10, window: '1m', prefix: 'comment' })
}

/**
 * Rate limit middleware for newsletter endpoints
 * 3 requests per hour
 */
export async function newsletterRateLimit(request) {
    return rateLimit(request, { max: 3, window: '1h', prefix: 'newsletter' })
}

/**
 * Rate limit middleware for post creation
 * 20 requests per minute
 */
export async function postRateLimit(request) {
    return rateLimit(request, { max: 20, window: '1m', prefix: 'post' })
}

/**
 * Rate limit middleware for general API
 * 30 requests per minute
 */
export async function apiRateLimit(request) {
    return rateLimit(request, { max: 30, window: '1m', prefix: 'api' })
}

/**
 * Helper to create rate limit response
 */
export function rateLimitResponse(result) {
    return NextResponse.json(
        {
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            limit: result.limit,
            remaining: result.remaining,
            reset: new Date(result.reset).toISOString(),
        },
        {
            status: 429,
            headers: {
                'X-RateLimit-Limit': result.limit.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': result.reset.toString(),
                'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
            },
        }
    )
}
