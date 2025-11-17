import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import NewsletterCampaign from '@/models/NewsletterCampaign'

// GET - Track email click and redirect
export async function GET(request, { params }) {
  try {
    const { campaignId, email } = params
    const decodedEmail = decodeURIComponent(email)
    
    const { searchParams } = new URL(request.url)
    const targetUrl = searchParams.get('url')

    if (!targetUrl) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL)
    }

    await connectDB()

    const campaign = await NewsletterCampaign.findById(campaignId)

    if (campaign && campaign.settings.trackClicks) {
      await campaign.recordClick(decodedEmail)
    }

    // Redirect to the actual URL
    return NextResponse.redirect(targetUrl)

  } catch (error) {
    console.error('Error tracking email click:', error)
    
    // Still redirect even on error
    const { searchParams } = new URL(request.url)
    const targetUrl = searchParams.get('url') || process.env.NEXT_PUBLIC_SITE_URL
    
    return NextResponse.redirect(targetUrl)
  }
}
