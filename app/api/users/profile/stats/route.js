import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import mongoose from 'mongoose'
import logger from '@/lib/logger'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const userId = new mongoose.Types.ObjectId(session.user.id)

    // ⚡ OPTIMIZATION 1: Use MongoDB aggregation instead of fetching all posts
    // Before: Fetches ALL posts with ALL fields (5-10 MB for 100 posts)
    // After: Returns only aggregated stats (~100 bytes)
    const [statsResult, user] = await Promise.all([
      // Aggregation pipeline for post statistics
      Post.aggregate([
        { $match: { author: userId } },
        {
          $facet: {
            // Count posts by status
            statusCounts: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ],
            // Calculate total views, likes, and comments
            totals: [
              {
                $group: {
                  _id: null,
                  totalViews: { $sum: '$views' },
                  totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } },
                  totalComments: {
                    $sum: {
                      $size: {
                        $filter: {
                          input: { $ifNull: ['$comments', []] },
                          cond: { $eq: ['$$this.isApproved', true] }
                        }
                      }
                    }
                  }
                }
              }
            ],
            // Get recent posts (last 5)
            recentPosts: [
              { $sort: { updatedAt: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  status: 1,
                  views: 1,
                  updatedAt: 1,
                  likeCount: { $size: { $ifNull: ['$likes', []] } },
                  commentCount: {
                    $size: {
                      $filter: {
                        input: { $ifNull: ['$comments', []] },
                        cond: { $eq: ['$$this.isApproved', true] }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      ]),
      // ⚡ OPTIMIZATION 2: Parallel query execution + .lean() for speed
      User.findById(session.user.id)
        .select('name email profilePictureUrl bio createdAt')
        .lean()
    ])

    // Process aggregation results
    const aggregationData = statsResult[0] || { statusCounts: [], totals: [], recentPosts: [] }

    // Build stats object from aggregation
    const stats = {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      pendingPosts: 0,
      rejectedPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0
    }

    // Process status counts
    aggregationData.statusCounts.forEach(item => {
      stats.totalPosts += item.count
      switch (item._id) {
        case 'published':
          stats.publishedPosts = item.count
          break
        case 'draft':
          stats.draftPosts = item.count
          break
        case 'pending_review':
          stats.pendingPosts = item.count
          break
        case 'rejected':
          stats.rejectedPosts = item.count
          break
      }
    })

    // Process totals
    if (aggregationData.totals.length > 0) {
      const totals = aggregationData.totals[0]
      stats.totalViews = totals.totalViews || 0
      stats.totalLikes = totals.totalLikes || 0
      stats.totalComments = totals.totalComments || 0
    }

    // Format recent posts
    const recentPosts = aggregationData.recentPosts.map(post => ({
      _id: post._id,
      title: post.title,
      status: post.status,
      views: post.views || 0,
      likes: post.likeCount || 0,
      comments: post.commentCount || 0,
      updatedAt: post.updatedAt
    }))

    return NextResponse.json({
      success: true,
      stats,
      recentPosts,
      user: {
        name: user?.name,
        email: user?.email,
        profilePictureUrl: user?.profilePictureUrl,
        bio: user?.bio,
        memberSince: user?.createdAt
      }
    }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Performance-Optimized': 'true'
      }
    })

  } catch (error) {
    logger.error('Error fetching profile stats:', { error })
    return NextResponse.json(
      { error: 'Failed to fetch profile statistics' },
      { status: 500 }
    )
  }
}
