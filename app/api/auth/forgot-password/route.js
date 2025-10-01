import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user by email (case-insensitive)
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    })

    // Verify account exists - as requested by user
    if (!user) {
      console.log('Password reset requested for non-existent email:', email)
      return NextResponse.json(
        { 
          error: 'No account found with this email address. Please check your email or create a new account.',
          emailNotFound: true
        },
        { status: 404 }
      )
    }

    // Check if user account is active
    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'This account has been deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Set token and expiry (1 hour from now)
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000 // 1 hour
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // TODO: In production, send email here using a service like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    
    // Example email content:
    // Subject: Reset Your Password
    // Body:
    // Hi {user.name},
    // You requested to reset your password. Click the link below:
    // {resetUrl}
    // This link will expire in 1 hour.
    // If you didn't request this, please ignore this email.
    
    // For now, log the reset link to console for testing
    console.log('\n=================================')
    console.log('✅ PASSWORD RESET REQUESTED')
    console.log('=================================')
    console.log('User:', user.name)
    console.log('Email:', user.email)
    console.log('User ID:', user._id)
    console.log('Reset Link:', resetUrl)
    console.log('Expires in: 1 hour')
    console.log('Token generated at:', new Date().toLocaleString())
    console.log('=================================\n')

    // In development, return the link in the response for testing
    // REMOVE THIS IN PRODUCTION!
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        message: 'Password reset link generated successfully',
        user: {
          name: user.name,
          email: user.email
        },
        resetUrl: resetUrl, // Only for development testing
        expiresIn: '1 hour',
        note: '⚠️ In production, this link will be sent via email only'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been sent to your email',
      email: user.email
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
