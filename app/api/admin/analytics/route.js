import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import Comment from '@/models/Comment'
import Category from '@/models/Category'
import AdminActivity from '@/models/AdminActivity'

/**
 * GET /api/admin/analytics
 * 
 * Get comprehensive analytics for admin dashboard
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
        const days = parseInt(searchParams.get('days') || '30')

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        // Fetch all analytics in parallel
        const [
            userStats,
            postStats,
            commentStats,
            categoryStats,
            activityStats,
            growthData,
            topContent
        ] = await Promise.all([
            // User statistics
            getUserStats(startDate),

            // Post statistics
            getPostStats(startDate),

            // Comment statistics
            getCommentStats(startDate),

            // Category statistics
            getCategoryStats(),

            // Activity statistics
            getActivityStats(startDate),

            // Growth data for charts
            getGrowthData(startDate),

            // Top performing content
            getTopContent()
        ])

        return NextResponse.json({
            success: true,
            analytics: {
                users: userStats,
                posts: postStats,
                comments: commentStats,
                categories: categoryStats,
                activity: activityStats,
                growth: growthData,
                topContent
            },
            period: {
                days,
                startDate,
                endDate: new Date()
            }
        })

    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper functions
async function getUserStats(startDate) {
    const [total, newUsers, activeUsers, adminCount] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: startDate } }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'admin' })
    ])

    return {
        total,
        newUsers,
        activeUsers,
        adminCount,
        growth: total > 0 ? ((newUsers / total) * 100).toFixed(1) : 0
    }
}

async function getPostStats(startDate) {
    const [total, published, pending, drafts, newPosts, totalViews, totalLikes] = await Promise.all([
        Post.countDocuments(),
        Post.countDocuments({ status: 'published' }),
        Post.countDocuments({ status: 'pending' }),
        Post.countDocuments({ status: 'draft' }),
        Post.countDocuments({ createdAt: { $gte: startDate } }),
        Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
        Post.aggregate([{ $group: { _id: null, total: { $sum: '$likeCount' } } }])
    ])

    return {
        total,
        published,
        pending,
        drafts,
        newPosts,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        growth: total > 0 ? ((newPosts / total) * 100).toFixed(1) : 0
    }
}

async function getCommentStats(startDate) {
    const [total, approved, pending, newComments] = await Promise.all([
        Comment.countDocuments(),
        Comment.countDocuments({ status: 'approved' }),
        Comment.countDocuments({ status: 'pending' }),
        Comment.countDocuments({ createdAt: { $gte: startDate } })
    ])

    return {
        total,
        approved,
        pending,
        newComments,
        growth: total > 0 ? ((newComments / total) * 100).toFixed(1) : 0
    }
}

async function getCategoryStats() {
    const [total, active, postsByCategory] = await Promise.all([
        Category.countDocuments(),
        Category.countDocuments({ isActive: true }),
        Post.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $project: {
                    name: '$category.name',
                    color: '$category.color',
                    count: 1
                }
            }
        ])
    ])

    return {
        total,
        active,
        postsByCategory
    }
}

async function getActivityStats(startDate) {
    const [totalActions, actionsByType] = await Promise.all([
        AdminActivity.countDocuments({ createdAt: { $gte: startDate } }),
        AdminActivity.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])
    ])

    return {
        totalActions,
        actionsByType
    }
}

async function getGrowthData(startDate) {
    const userGrowth = await User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ])

    const postGrowth = await Post.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ])

    return {
        users: userGrowth,
        posts: postGrowth
    }
}

async function getTopContent() {
    const [topPosts, topAuthors] = await Promise.all([
        Post.find({ status: 'published' })
            .sort({ views: -1 })
            .limit(10)
            .select('title views likeCount comments author')
            .populate('author', 'name')
            .lean(),

        Post.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$author', postCount: { $sum: 1 }, totalViews: { $sum: '$views' } } },
            { $sort: { totalViews: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $project: {
                    name: '$author.name',
                    email: '$author.email',
                    postCount: 1,
                    totalViews: 1
                }
            }
        ])
    ])

    return {
        topPosts,
        topAuthors
    }
}
