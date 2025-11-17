import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import NewsletterCampaign from '@/models/NewsletterCampaign'
import Newsletter from '@/models/Newsletter'
import Post from '@/models/Post'
import { sendBulkEmails, sendEmail } from '@/lib/email'
import { generateNewsletterHTML } from '@/lib/email-templates/newsletter-templates'

// POST - Send newsletter campaign
export async function POST(request, context) {
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
    const { testEmail } = await request.json()

    const campaign = await NewsletterCampaign.findById(params.id)
      .populate('targetCategories')
      .populate('featuredPosts')

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch blog posts if featured posts are selected
    let posts = []
    if (campaign.featuredPosts && campaign.featuredPosts.length > 0) {
      posts = await Post.find({
        _id: { $in: campaign.featuredPosts }
      })
        .populate('author', 'name profileImage')
        .populate('category', 'name slug color')
        .lean()
    }

    // If sending test email
    if (testEmail) {
      // Create test subscriber object
      const testSubscriber = { email: testEmail }
      
      // Generate beautiful branded HTML
      const testHtml = generateNewsletterHTML(
        campaign,
        posts,
        testSubscriber,
        campaign.layoutSettings?.template || 'featured'
      )
      
      const result = await sendEmail({
        to: testEmail,
        subject: `[TEST] ${campaign.subject}`,
        html: testHtml
      })

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Test email sent to ${testEmail}`
        })
      } else {
        return NextResponse.json(
          { error: 'Failed to send test email: ' + result.error },
          { status: 500 }
        )
      }
    }

    // Check if campaign can be sent
    if (campaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Campaign has already been sent' },
        { status: 400 }
      )
    }

    if (campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Campaign is currently being sent' },
        { status: 400 }
      )
    }

    // Mark as sending
    campaign.status = 'sending'
    await campaign.save()

    // Get subscribers based on targeting
    let subscribers = []

    if (campaign.targetAudience === 'all') {
      subscribers = await Newsletter.getActiveSubscribers()
    } else if (campaign.targetAudience === 'category' && campaign.targetCategories.length > 0) {
      const categoryIds = campaign.targetCategories.map(cat => cat._id)
      subscribers = await Newsletter.find({
        isActive: true,
        'preferences.categories': { $in: categoryIds }
      })
    } else if (campaign.targetAudience === 'custom' && campaign.targetEmails.length > 0) {
      subscribers = await Newsletter.find({
        isActive: true,
        email: { $in: campaign.targetEmails }
      })
    }

    if (subscribers.length === 0) {
      campaign.status = 'failed'
      await campaign.save()
      return NextResponse.json(
        { error: 'No active subscribers found for this campaign' },
        { status: 400 }
      )
    }

    // Update campaign analytics
    campaign.analytics.totalRecipients = subscribers.length
    await campaign.save()

    // Generate emails with beautiful branded template
    const emails = subscribers.map(subscriber => {
      const html = generateNewsletterHTML(
        campaign,
        posts,
        subscriber,
        campaign.layoutSettings?.template || 'featured'
      )
      
      return {
        to: subscriber.email,
        subject: campaign.subject,
        html,
        text: campaign.content
      }
    })

    // Send emails in batches
    let progressCallback = ({ current, total, sent, failed }) => {
      console.log(`Sending progress: ${current}/${total} (Sent: ${sent}, Failed: ${failed})`)
    }

    const results = await sendBulkEmails(emails, progressCallback)

    // Update campaign analytics
    campaign.analytics.sentCount = results.sent
    campaign.analytics.failedCount = results.failed

    // Store individual email records
    campaign.analytics.sentEmails = subscribers.map((subscriber) => ({
      email: subscriber.email,
      sentAt: new Date(),
      status: results.errors.find(e => e.email === subscriber.email) ? 'failed' : 'sent',
      errorMessage: results.errors.find(e => e.email === subscriber.email)?.error || null,
      opened: false,
      clicked: false
    }))

    // Update campaign status
    if (results.failed === 0) {
      await campaign.markAsSent()
    } else if (results.sent === 0) {
      await campaign.markAsFailed()
    } else {
      // Partially sent
      await campaign.markAsSent()
    }

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${results.sent} subscribers`,
      results: {
        total: results.total,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors
      }
    })

  } catch (error) {
    console.error('Error sending newsletter campaign:', error)
    
    // Try to mark campaign as failed
    try {
      const params = await context.params
      const campaign = await NewsletterCampaign.findById(params.id)
      if (campaign) {
        await campaign.markAsFailed()
      }
    } catch (updateError) {
      console.error('Error updating campaign status:', updateError)
    }

    return NextResponse.json(
      { error: 'Failed to send newsletter campaign: ' + error.message },
      { status: 500 }
    )
  }
}
