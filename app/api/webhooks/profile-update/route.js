import { NextResponse } from 'next/server'
import { redisCache } from '@/lib/redis-cache'

export async function POST(request) {
    try {
        const { userId, action } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            )
        }

        // Invalidate profile cache
        const cacheKeys = [
            `profile-stats-${userId}`,
            `profile-data-${userId}`,
            `user-${userId}`
        ]

        for (const key of cacheKeys) {
            await redisCache.delete(key)
        }

        console.log(`🗑️ Cache invalidated for user ${userId} (action: ${action})`)

        return NextResponse.json({
            success: true,
            invalidated: cacheKeys.length
        })
    } catch (error) {
        console.error('Cache invalidation error:', error)
        return NextResponse.json(
            { error: 'Failed to invalidate cache' },
            { status: 500 }
        )
    }
}
