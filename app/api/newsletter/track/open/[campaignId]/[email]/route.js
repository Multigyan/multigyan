import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import NewsletterCampaign from '@/models/NewsletterCampaign'

// GET - Track email open (transparent pixel)
export async function GET(request, { params }) {
  try {
    const { campaignId, email } = params
    const decodedEmail = decodeURIComponent(email)

    await connectDB()

    const campaign = await NewsletterCampaign.findById(campaignId)

    if (campaign && campaign.settings.trackOpens) {
      await campaign.recordOpen(decodedEmail)
    }

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error tracking email open:', error)
    
    // Still return pixel even on error
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif'
      }
    })
  }
}
