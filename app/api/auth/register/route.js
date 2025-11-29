import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateUsername, validateUsername } from '@/lib/generateUsername'

export async function POST(request) {
  try {
    const { name, email, username, password, confirmPassword } = await request.json()

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Handle username
    let finalUsername = username?.trim().toLowerCase()

    if (finalUsername) {
      // Validate provided username
      const validation = validateUsername(finalUsername)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }

      // Check if username is already taken
      const existingUsername = await User.findOne({ username: finalUsername })
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        )
      }
    } else {
      // Auto-generate username from name
      finalUsername = await generateUsername(name)
    }

    // Check for initial admin setup
    const adminCount = await User.getAdminCount()
    const initialAdminEmails = process.env.INITIAL_ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []

    let userRole = 'author' // Default role

    // If no admins exist and this email is in the initial admin list, make them admin
    if (adminCount === 0 && initialAdminEmails.includes(email.toLowerCase())) {
      userRole = 'admin'
    }

    // Create new user (password will be hashed automatically by the pre-save hook)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      username: finalUsername,
      password, // Will be hashed by the pre-save hook
      role: userRole
    })

    await newUser.save()

    // Return success (without password)
    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      )
    }

    // Handle duplicate key error (11000)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}