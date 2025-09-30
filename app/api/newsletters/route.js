import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Newsletter from '@/models/Newsletter'

// GET - Get newsletter subscribers (admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const status = searchParams.get('status') // 'active', 'inactive', 'all'
    const search = searchParams.get('search')

    // Build query
    let query = {}
    
    if (status && status !== 'all') {
      query.isActive = status === 'active'
    }

    if (search) {
      query.email = { $regex: search, $options: 'i' }
    }

    // Get subscribers with pagination
    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('preferences.categories', 'name slug')

    const total = await Newsletter.countDocuments(query)
    const stats = await Newsletter.getStats()

    return NextResponse.json({
      success: true,
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || { total: 0, active: 0, inactive: 0 }
    })

  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Subscribe to newsletter
export async function POST(request) {
  try {
    await connectDB()

    const { email, source = 'website', preferences = {} } = await request.json()

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase().trim() })
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        await existingSubscriber.resubscribe()
        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          subscriber: existingSubscriber
        })
      }
    }

    // Get client info for metadata
    const clientInfo = {
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      referrer: request.headers.get('referer') || 'direct'
    }

    // Create new subscriber
    const subscriber = new Newsletter({
      email: email.toLowerCase().trim(),
      source,
      preferences: {
        frequency: preferences.frequency || 'weekly',
        categories: preferences.categories || []
      },
      metadata: clientInfo
    })

    await subscriber.save()

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
      subscriber: {
        id: subscriber._id,
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
        preferences: subscriber.preferences
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}

// DELETE - Bulk delete subscribers (admin only)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { subscriberIds } = await request.json()

    if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber IDs are required' },
        { status: 400 }
      )
    }

    const result = await Newsletter.deleteMany({
      _id: { $in: subscriberIds }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} subscribers`,
      deletedCount: result.deletedCount
    })

  } catch (error) {
    console.error('Error deleting newsletter subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscribers' },
      { status: 500 }
    )
  }
}
