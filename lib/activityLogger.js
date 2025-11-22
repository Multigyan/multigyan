/**
 * Activity Logger Utility
 * 
 * Centralized logging for all admin actions
 */

import AdminActivity from '@/models/AdminActivity'

/**
 * Log admin activity
 */
export async function logAdminActivity({
    adminId,
    action,
    targetType,
    targetId,
    details = {},
    metadata = {}
}) {
    try {
        await AdminActivity.logActivity({
            admin: adminId,
            action,
            targetType,
            targetId,
            details,
            metadata: {
                ...metadata,
                success: true
            }
        })
    } catch (error) {
        console.error('Failed to log activity:', error)
    }
}

/**
 * Log failed admin activity
 */
export async function logAdminError({
    adminId,
    action,
    targetType,
    targetId,
    errorMessage,
    metadata = {}
}) {
    try {
        await AdminActivity.logActivity({
            admin: adminId,
            action,
            targetType,
            targetId,
            metadata: {
                ...metadata,
                success: false,
                errorMessage
            }
        })
    } catch (error) {
        console.error('Failed to log error:', error)
    }
}

/**
 * Get activity summary for dashboard
 */
export async function getActivitySummary(days = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [totalActions, actionsByType, topAdmins] = await Promise.all([
        // Total actions
        AdminActivity.countDocuments({
            createdAt: { $gte: startDate }
        }),

        // Actions by type
        AdminActivity.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]),

        // Top admins by activity
        AdminActivity.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$admin',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'admin'
                }
            },
            {
                $unwind: '$admin'
            },
            {
                $project: {
                    name: '$admin.name',
                    email: '$admin.email',
                    count: 1
                }
            }
        ])
    ])

    return {
        totalActions,
        actionsByType,
        topAdmins
    }
}

/**
 * Get activity timeline for charts
 */
export async function getActivityTimeline(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const timeline = await AdminActivity.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$createdAt'
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ])

    return timeline
}
