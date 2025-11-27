import { NextResponse } from 'next/server'
import { authRateLimit, rateLimitResponse } from '@/lib/ratelimit'

/**
 * Login Rate Limiting Endpoint
 * 
 * This endpoint should be called BEFORE attempting NextAuth sign in
 * to check if the user has exceeded login attempts.
 * 
 * Usage in client:
 * 1. Call POST /api/auth/check-rate-limit with email
 * 2. If 200, proceed with signIn()
 * 3. If 429, show rate limit error
 */
export async function POST(request) {
    try {
        // Check rate limit
        const rateLimitResult = await authRateLimit(request)

        if (!rateLimitResult.success) {
            return rateLimitResponse(rateLimitResult)
        }

        // Rate limit OK
        return NextResponse.json({
            success: true,
            message: 'Rate limit check passed',
            remaining: rateLimitResult.remaining
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
