import { NextResponse } from 'next/server'
import { getUnifiedStats } from '@/lib/stats'
import logger from '@/lib/logger'

// ✅ Unified stats API - now uses centralized stats service
export async function GET() {
    try {
        const data = await getUnifiedStats()

        return NextResponse.json({
            success: true,
            ...data
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
            }
        })

    } catch (error) {
        logger.error('Error fetching unified stats:', { error })
        return NextResponse.json(
            { success: false, error: 'Failed to calculate stats' },
            { status: 500 }
        )
    }
}
