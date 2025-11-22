import { NextResponse } from 'next/server'

// Simple in-memory analytics store (in production, use a database)
const profileViews = new Map()

export async function POST(request) {
    try {
        const { profileId, username, timestamp } = await request.json()

        if (!profileId || !username) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Track the view
        const key = `${profileId}-${new Date().toDateString()}`
        const currentViews = profileViews.get(key) || 0
        profileViews.set(key, currentViews + 1)

        // Log to console (in production, send to analytics service)
        console.log(`📊 Profile View: ${username} (${profileId}) - Total today: ${currentViews + 1}`)

        // In production, you would:
        // 1. Send to Google Analytics
        // 2. Store in database
        // 3. Send to analytics service (Mixpanel, Amplitude, etc.)

        return NextResponse.json({
            success: true,
            views: currentViews + 1
        })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json(
            { error: 'Failed to track view' },
            { status: 500 }
        )
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const profileId = searchParams.get('profileId')

        if (!profileId) {
            return NextResponse.json(
                { error: 'Missing profileId' },
                { status: 400 }
            )
        }

        const key = `${profileId}-${new Date().toDateString()}`
        const views = profileViews.get(key) || 0

        return NextResponse.json({
            profileId,
            views,
            date: new Date().toDateString()
        })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json(
            { error: 'Failed to get views' },
            { status: 500 }
        )
    }
}
