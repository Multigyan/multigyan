import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'

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

    // Get user's posts statistics
    const posts = await Post.find({ author: session.user.id })

    // Calculate statistics
    const totalPosts = posts.length
    const publishedPosts = posts.filter(p => p.status === 'published').length
    const draftPosts = posts.filter(p => p.status === 'draft').length
    const pendingPosts = posts.filter(p => p.status === 'pending_review').length
    const rejectedPosts = posts.filter(p => p.status === 'rejected').length

    // Calculate total views
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0)

    // Calculate total likes
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)

    // Calculate total comments (only approved comments)
    const totalComments = posts.reduce((sum, post) => {
      const approvedComments = post.comments?.filter(c => c.isApproved) || []
      return sum + approvedComments.length
    }, 0)

    // Get recent activity (last 5 posts)
    const recentPosts = posts
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(post => ({
        _id: post._id,
        title: post.title,
        status: post.status,
        views: post.views || 0,
        likes: post.likes?.length || 0,
        comments: post.comments?.filter(c => c.isApproved).length || 0,
        updatedAt: post.updatedAt
      }))

    // Get user info
    const user = await User.findById(session.user.id)
      .select('name email profilePictureUrl bio createdAt')

    return NextResponse.json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        pendingPosts,
        rejectedPosts,
        totalViews,
        totalLikes,
        totalComments
      },
      recentPosts,
      user: {
        name: user?.name,
        email: user?.email,
        profilePictureUrl: user?.profilePictureUrl,
        bio: user?.bio,
        memberSince: user?.createdAt
      }
    })

  } catch (error) {
    console.error('Error fetching profile stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile statistics' },
      { status: 500 }
    )
  }
}
