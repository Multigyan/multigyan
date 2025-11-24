import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import PostAnalytics from '@/models/PostAnalytics'

/**
 * Dashboard Analytics API
 * 
 * GET /api/analytics/dashboard - Get overall dashboard analytics
 * GET /api/analytics/top-posts - Get top performing posts
 */

// GET - Dashboard analytics
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days')) || 30
        const action = searchParams.get('action') || 'dashboard'

        await connectDB()

        if (action === 'top-posts') {
            // Get top performing posts
            const limit = parseInt(searchParams.get('limit')) || 10
            const topPosts = await PostAnalytics.getTopPosts(days, limit)

            return NextResponse.json({
                topPosts,
                period: `Last ${days} days`
            })
        }

        // Default: Get overall dashboard stats
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        // Aggregate all analytics
        const stats = await PostAnalytics.aggregate([
            { $match: { date: { $gte: startDate } } },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views.total' },
                    uniqueViews: { $sum: '$views.unique' },
                    totalLikes: { $sum: '$likes' },
                    totalComments: { $sum: '$comments' },
                    totalShares: { $sum: '$shares' },
                    avgReadTime: { $avg: '$avgReadTime' },
                    avgBounceRate: { $avg: '$bounceRate' }
                }
            }
        ])

        // Get daily trend
        const dailyTrend = await PostAnalytics.aggregate([
            { $match: { date: { $gte: startDate } } },
            {
                $group: {
                    _id: '$date',
                    views: { $sum: '$views.total' },
                    likes: { $sum: '$likes' },
                    comments: { $sum: '$comments' }
                }
            },
            { $sort: { _id: 1 } }
        ])

        return NextResponse.json({
            summary: stats[0] || {
                totalViews: 0,
                uniqueViews: 0,
                totalLikes: 0,
                totalComments: 0,
                totalShares: 0,
                avgReadTime: 0,
                avgBounceRate: 0
            },
            dailyTrend,
            period: `Last ${days} days`
        })

    } catch (error) {
        console.error('Dashboard analytics error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch analytics', details: error.message },
            { status: 500 }
        )
    }
}
