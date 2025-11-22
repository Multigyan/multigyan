import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import AdminActivity from '@/models/AdminActivity'
import { getActivitySummary, getActivityTimeline } from '@/lib/activityLogger'

/**
 * GET /api/admin/activity
 * 
 * Get admin activity logs and analytics
 */
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            )
        }

        await connectDB()

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'recent' // recent, summary, timeline
        const days = parseInt(searchParams.get('days') || '30')
        const limit = parseInt(searchParams.get('limit') || '50')

        let data

        switch (type) {
            case 'recent':
                // Get recent activity
                data = await AdminActivity.getRecentActivity(limit)
                break

            case 'summary':
                // Get activity summary
                data = await getActivitySummary(days)
                break

            case 'timeline':
                // Get activity timeline for charts
                data = await getActivityTimeline(days)
                break

            case 'by-admin':
                // Get activity by specific admin
                const adminId = searchParams.get('adminId')
                if (!adminId) {
                    return NextResponse.json(
                        { error: 'Admin ID required' },
                        { status: 400 }
                    )
                }
                data = await AdminActivity.getActivityByAdmin(adminId, limit)
                break

            case 'stats':
                // Get activity statistics
                data = await AdminActivity.getActivityStats(days)
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid type parameter' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            data,
            type,
            days,
            limit
        })

    } catch (error) {
        console.error('Error fetching admin activity:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
