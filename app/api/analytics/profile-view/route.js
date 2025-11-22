import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import ProfileView from '@/models/ProfileView'

// Helper to parse user agent
function parseUserAgent(userAgent) {
    if (!userAgent) return { deviceType: 'unknown', browser: null, os: null }

    const ua = userAgent.toLowerCase()

    // Device type
    let deviceType = 'desktop'
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
        deviceType = 'mobile'
    } else if (/tablet|ipad/i.test(ua)) {
        deviceType = 'tablet'
    }

    // Browser
    let browser = 'unknown'
    if (ua.includes('chrome')) browser = 'Chrome'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('safari')) browser = 'Safari'
    else if (ua.includes('edge')) browser = 'Edge'

    // OS
    let os = 'unknown'
    if (ua.includes('windows')) os = 'Windows'
    else if (ua.includes('mac')) os = 'macOS'
    else if (ua.includes('linux')) os = 'Linux'
    else if (ua.includes('android')) os = 'Android'
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

    return { deviceType, browser, os }
}

export async function POST(request) {
    // Return success immediately to not block anything
    try {
        const { profileId, username } = await request.json()

        if (!profileId || !username) {
            return NextResponse.json({ success: true }, { status: 200 })
        }

        // Track analytics in background (fire and forget)
        setImmediate(async () => {
            try {
                await connectDB()
                const session = await getServerSession(authOptions)
                const referrer = request.headers.get('referer')
                const userAgent = request.headers.get('user-agent')
                const { deviceType, browser, os } = parseUserAgent(userAgent)

                if (ProfileView) {
                    await ProfileView.create({
                        profileId,
                        username,
                        timestamp: new Date(),
                        referrer,
                        userAgent,
                        viewerUserId: session?.user?.id || null,
                        deviceType,
                        browser,
                        os
                    })
                    console.log(`📊 Profile View: ${username}`)
                }
            } catch (error) {
                // Silently fail
            }
        })

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: true }, { status: 200 })
    }
}

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const profileId = searchParams.get('profileId')
        const period = searchParams.get('period') || 'today'

        if (!profileId) {
            return NextResponse.json(
                { error: 'Missing profileId' },
                { status: 400 }
            )
        }

        // Calculate date range
        let startDate = new Date()
        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0)
                break
            case 'week':
                startDate.setDate(startDate.getDate() - 7)
                break
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1)
                break
            case 'all':
                startDate = null
                break
        }

        // Get analytics
        const [totalViews, uniqueViewers, conversionRate] = await Promise.all([
            ProfileView.getViewCount(profileId, startDate),
            ProfileView.getUniqueViewers(profileId, startDate),
            ProfileView.getConversionRate(profileId)
        ])

        return NextResponse.json({
            profileId,
            period,
            totalViews,
            uniqueViewers,
            conversionRate: conversionRate.toFixed(2) + '%',
            startDate: startDate?.toISOString() || null
        })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json(
            { error: 'Failed to get analytics' },
            { status: 500 }
        )
    }
}
