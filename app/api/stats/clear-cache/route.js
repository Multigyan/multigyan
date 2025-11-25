import { NextResponse } from 'next/server'
import { clearStatsCache } from '@/lib/stats'

// API endpoint to clear the stats cache
export async function POST() {
    try {
        clearStatsCache()

        return NextResponse.json({
            success: true,
            message: 'Stats cache cleared successfully'
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to clear cache' },
            { status: 500 }
        )
    }
}

// Also allow GET for easy browser testing
export async function GET() {
    return POST()
}
