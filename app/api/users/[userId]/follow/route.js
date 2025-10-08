import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Notification from '@/models/Notification'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ FIX: Await params before using (Next.js 15+ requirement)
    const resolvedParams = await params
    const { userId } = resolvedParams
    const currentUserId = session.user.id

    // Can't follow yourself
    if (userId === currentUserId) {
      return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 })
    }

    await connectDB()

    // Check if target user exists
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentUser = await User.findById(currentUserId)

    // Check if already following
    const isFollowing = currentUser.following.includes(userId)

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userId
      )
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUserId
      )
      
      // Update stats
      currentUser.stats.followingCount = Math.max(0, currentUser.stats.followingCount - 1)
      targetUser.stats.followersCount = Math.max(0, targetUser.stats.followersCount - 1)

      await currentUser.save()
      await targetUser.save()

      return NextResponse.json({
        success: true,
        isFollowing: false,
        message: 'Unfollowed successfully',
        followersCount: targetUser.stats.followersCount
      })
    } else {
      // Follow
      currentUser.following.push(userId)
      targetUser.followers.push(currentUserId)
      
      // Update stats
      currentUser.stats.followingCount += 1
      targetUser.stats.followersCount += 1

      await currentUser.save()
      await targetUser.save()

      // CREATE NOTIFICATION for new follower
      try {
        await Notification.createNotification({
          recipient: userId,
          sender: currentUserId,
          type: 'follow',
          message: `${session.user.name} started following you`,
          link: `/profile/${session.user.username || currentUserId}`
        })
      } catch (notifError) {
        console.error('Error creating follow notification:', notifError)
        // Don't fail the follow action if notification fails
      }

      return NextResponse.json({
        success: true,
        isFollowing: true,
        message: 'Followed successfully',
        followersCount: targetUser.stats.followersCount
      })
    }

  } catch (error) {
    console.error('Follow/Unfollow error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// Get follow status
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ isFollowing: false })
    }

    // ✅ FIX: Await params before using (Next.js 15+ requirement)
    const resolvedParams = await params
    const { userId } = resolvedParams
    const currentUserId = session.user.id

    await connectDB()

    const currentUser = await User.findById(currentUserId)
    const isFollowing = currentUser.following.includes(userId)

    return NextResponse.json({ isFollowing })

  } catch (error) {
    console.error('Get follow status error:', error)
    return NextResponse.json({ isFollowing: false })
  }
}
