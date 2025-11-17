import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import NewsletterCampaign from '@/models/NewsletterCampaign'

// GET - Get all newsletter campaigns (admin only)
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
    const limit = parseInt(searchParams.get('limit')) || 10
    const status = searchParams.get('status') // 'all', 'draft', 'sent', 'scheduled'

    // Build query
    let query = {}
    if (status && status !== 'all') {
      query.status = status
    }

    // Get campaigns with pagination
    const campaigns = await NewsletterCampaign.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email profileImage')
      .populate('featuredPosts', 'title slug featuredImage')

    const total = await NewsletterCampaign.countDocuments(query)

    // Get stats
    const stats = await NewsletterCampaign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statsMap = {
      draft: 0,
      scheduled: 0,
      sending: 0,
      sent: 0,
      failed: 0
    }

    stats.forEach(stat => {
      statsMap[stat._id] = stat.count
    })

    return NextResponse.json({
      success: true,
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statsMap
    })

  } catch (error) {
    console.error('Error fetching newsletter campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new newsletter campaign (admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const {
      title,
      subject,
      previewText,
      content,
      htmlContent,
      scheduledFor,
      targetAudience,
      targetCategories,
      targetEmails,
      template,
      featuredPosts,
      settings
    } = await request.json()

    // Validation
    if (!title || !subject || !content || !htmlContent) {
      return NextResponse.json(
        { error: 'Title, subject, content and HTML content are required' },
        { status: 400 }
      )
    }

    // Create campaign
    const campaign = new NewsletterCampaign({
      title,
      subject,
      previewText: previewText || '',
      content,
      htmlContent,
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: scheduledFor || null,
      createdBy: session.user.id,
      targetAudience: targetAudience || 'all',
      targetCategories: targetCategories || [],
      targetEmails: targetEmails || [],
      template: template || 'basic',
      featuredPosts: featuredPosts || [],
      settings: settings || {
        trackOpens: true,
        trackClicks: true,
        allowUnsubscribe: true
      }
    })

    await campaign.save()

    // Populate for response
    await campaign.populate('createdBy', 'name email profileImage')
    await campaign.populate('featuredPosts', 'title slug featuredImage')

    return NextResponse.json({
      success: true,
      message: 'Newsletter campaign created successfully',
      campaign
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating newsletter campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create newsletter campaign' },
      { status: 500 }
    )
  }
}
