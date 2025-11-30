import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import Post from '@/models/Post'
import User from '@/models/User'

// GET - Get notifications for current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const skip = (page - 1) * limit

    // Build query
    const query = { recipient: session.user.id }
    if (unreadOnly) {
      query.isRead = false
    }

    // Get notifications
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'name username profilePictureUrl')
        .populate('post', 'title slug')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Notification.countDocuments(query),
      Notification.getUnreadCount(session.user.id)
    ])

    // Add debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[NOTIFICATIONS] User ${session.user.id}: ${unreadCount} unread, ${total} total`)
    }

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// PUT - Mark notifications as read
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()
    const { notificationIds, markAll } = body

    // Get count BEFORE update for logging
    const beforeCount = await Notification.countDocuments({
      recipient: session.user.id,
      isRead: false
    })

    if (markAll) {
      // Mark all notifications as read
      const result = await Notification.markAllAsRead(session.user.id)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MARK ALL READ] User ${session.user.id}: ${beforeCount} unread before, ${result.modifiedCount} marked as read`)
      }
    } else if (notificationIds && notificationIds.length > 0) {
      await Notification.markAsRead(notificationIds, session.user.id)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MARK READ] User ${session.user.id}: Marked ${notificationIds.length} notifications as read`)
      }
    }

    // Get fresh unread count after update
    const unreadCount = await Notification.getUnreadCount(session.user.id)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AFTER UPDATE] User ${session.user.id}: ${unreadCount} unread remaining`)
    }

    return NextResponse.json({
      success: true,
      unreadCount,
      debug: {
        beforeCount,
        afterCount: unreadCount
      }
    })

  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a notification
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      )
    }

    // Delete only if user owns this notification
    await Notification.deleteOne({
      _id: notificationId,
      recipient: session.user.id
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
