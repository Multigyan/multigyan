import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import NewsletterCampaign from '@/models/NewsletterCampaign'

// GET - Get specific campaign
export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // ✅ FIX: Await params in Next.js 15
    const params = await context.params

    const campaign = await NewsletterCampaign.findById(params.id)
      .populate('createdBy', 'name email profileImage')
      .populate('featuredPosts', 'title slug featuredImage contentType')
      .populate('targetCategories', 'name slug')

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Error fetching newsletter campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update campaign
export async function PUT(request, context) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // ✅ FIX: Await params in Next.js 15
    const params = await context.params

    const campaign = await NewsletterCampaign.findById(params.id)

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Don't allow editing sent campaigns
    if (campaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot edit sent campaigns' },
        { status: 400 }
      )
    }

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
      settings,
      notes
    } = await request.json()

    // Update fields
    if (title) campaign.title = title
    if (subject) campaign.subject = subject
    if (previewText !== undefined) campaign.previewText = previewText
    if (content) campaign.content = content
    if (htmlContent) campaign.htmlContent = htmlContent
    if (scheduledFor !== undefined) {
      campaign.scheduledFor = scheduledFor
      campaign.status = scheduledFor ? 'scheduled' : 'draft'
    }
    if (targetAudience) campaign.targetAudience = targetAudience
    if (targetCategories) campaign.targetCategories = targetCategories
    if (targetEmails) campaign.targetEmails = targetEmails
    if (template) campaign.template = template
    if (featuredPosts) campaign.featuredPosts = featuredPosts
    if (settings) campaign.settings = { ...campaign.settings, ...settings }
    if (notes !== undefined) campaign.notes = notes

    await campaign.save()

    // Populate for response
    await campaign.populate('createdBy', 'name email profileImage')
    await campaign.populate('featuredPosts', 'title slug featuredImage')
    await campaign.populate('targetCategories', 'name slug')

    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign
    })

  } catch (error) {
    console.error('Error updating newsletter campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

// DELETE - Delete campaign
export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // ✅ FIX: Await params in Next.js 15
    const params = await context.params

    const campaign = await NewsletterCampaign.findById(params.id)

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Don't allow deleting sent campaigns (only mark as archived)
    if (campaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot delete sent campaigns. Archive them instead.' },
        { status: 400 }
      )
    }

    await campaign.deleteOne()

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting newsletter campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
