import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import Category from '@/models/Category'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can access
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    // Get PLATFORM-WIDE statistics
    const [
      totalPosts,
      publishedPosts,
      pendingPosts,
      draftPosts,
      rejectedPosts,
      totalUsers,
      totalAdmins,
      totalAuthors,
      activeUsers,
      totalCategories,
      allPublishedPosts
    ] = await Promise.all([
      Post.countDocuments({}),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'pending_review' }),
      Post.countDocuments({ status: 'draft' }),
      Post.countDocuments({ status: 'rejected' }),
      User.countDocuments({}),
      User.countDocuments({ role: 'admin', isActive: true }),
      User.countDocuments({ role: 'author' }),
      User.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Post.find({ status: 'published' }).select('views likes comments')
    ])
    
    // Calculate engagement stats
    const totalViews = allPublishedPosts.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalLikes = allPublishedPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0)
    const totalComments = allPublishedPosts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)
    
    return NextResponse.json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        authors: totalAuthors,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        pending: pendingPosts,
        draft: draftPosts,
        rejected: rejectedPosts
      },
      engagement: {
        totalViews,
        totalLikes,
        totalComments,
        avgViewsPerPost: publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0,
        engagementRate: totalViews > 0 ? Math.round((totalLikes / totalViews) * 100) : 0
      },
      categories: {
        total: totalCategories,
        active: totalCategories
      }
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
