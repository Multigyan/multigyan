import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import NewsletterCampaign from '@/models/NewsletterCampaign'
import Newsletter from '@/models/Newsletter'
import { sendNewsletterCampaign, sendEmail } from '@/lib/email'

// POST - Send newsletter campaign
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

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

    // If sending test email
    if (testEmail) {
      // Generate HTML for test email
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(testEmail)}`
      const testHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${campaign.subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${campaign.htmlContent}
            
            <div style="text-align: center; margin-top: 40px; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee;">
              <p style="color: red; font-weight: bold;">⚠️ THIS IS A TEST EMAIL ⚠️</p>
              <p>© ${new Date().getFullYear()} Multigyan. All rights reserved.</p>
              <p>
                You're receiving this email because you subscribed to our newsletter.
              </p>
              <p>
                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe</a> | 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #667eea; text-decoration: none;">Visit Website</a>
              </p>
            </div>
          </body>
        </html>
      `
      
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

    // Send emails in background
    // Note: This sends all emails synchronously. For production, consider using a queue system.
    let progressCallback = ({ current, total, sent, failed }) => {
      console.log(`Sending progress: ${current}/${total} (Sent: ${sent}, Failed: ${failed})`)
    }

    const results = await sendNewsletterCampaign(campaign, subscribers, progressCallback)

    // Update campaign analytics
    campaign.analytics.sentCount = results.sent
    campaign.analytics.failedCount = results.failed

    // Store individual email records
    campaign.analytics.sentEmails = subscribers.map((subscriber, index) => ({
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
