import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Newsletter from '@/models/Newsletter'
import { sendWelcomeEmail } from '@/lib/email'

// POST - Subscribe to newsletter (SIMPLE VERSION - NO DOUBLE OPT-IN)
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
    const existingSubscriber = await Newsletter.findOne({ 
      email: email.toLowerCase().trim() 
    })
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        await existingSubscriber.resubscribe()
        
        // Send welcome email
        await sendWelcomeEmail(existingSubscriber.email, existingSubscriber)
        
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

    // Create new subscriber - INSTANTLY ACTIVE
    const subscriber = new Newsletter({
      email: email.toLowerCase().trim(),
      source,
      isActive: true, // Always active immediately
      preferences: {
        frequency: preferences.frequency || 'weekly',
        categories: preferences.categories || []
      },
      metadata: clientInfo
    })

    await subscriber.save()

    // Send welcome email immediately
    try {
      await sendWelcomeEmail(subscriber.email, subscriber)
    } catch (emailError) {
      // Log error but don't fail the subscription
      console.error('Welcome email failed:', emailError)
      // Subscription still succeeds even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter! Check your inbox for a welcome email.',
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
      { error: 'Failed to subscribe to newsletter. Please try again later.' },
      { status: 500 }
    )
  }
}
