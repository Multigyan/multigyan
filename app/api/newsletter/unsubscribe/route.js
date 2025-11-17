import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Newsletter from '@/models/Newsletter'

// GET - Unsubscribe from newsletter (via email link)
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.redirect(
        new URL('/?error=invalid_email', process.env.NEXT_PUBLIC_SITE_URL)
      )
    }

    const subscriber = await Newsletter.findOne({ 
      email: email.toLowerCase().trim() 
    })

    if (!subscriber) {
      return NextResponse.redirect(
        new URL('/?error=not_found', process.env.NEXT_PUBLIC_SITE_URL)
      )
    }

    if (!subscriber.isActive) {
      return NextResponse.redirect(
        new URL('/?newsletter=already_unsubscribed', process.env.NEXT_PUBLIC_SITE_URL)
      )
    }

    // Unsubscribe
    await subscriber.unsubscribe()

    return NextResponse.redirect(
      new URL('/?newsletter=unsubscribed', process.env.NEXT_PUBLIC_SITE_URL)
    )

  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.redirect(
      new URL('/?error=unsubscribe_failed', process.env.NEXT_PUBLIC_SITE_URL)
    )
  }
}

// POST - Unsubscribe from newsletter (via API)
export async function POST(request) {
  try {
    await connectDB()

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const subscriber = await Newsletter.findOne({ 
      email: email.toLowerCase().trim() 
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email not found in our subscriber list' },
        { status: 404 }
      )
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { error: 'This email is already unsubscribed' },
        { status: 400 }
      )
    }

    await subscriber.unsubscribe()

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again later.' },
      { status: 500 }
    )
  }
}
