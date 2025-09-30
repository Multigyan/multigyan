import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const { username } = await request.json()

    // Validate username format
    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { available: false, message: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (username.length > 30) {
      return NextResponse.json(
        { available: false, message: 'Username cannot be more than 30 characters' },
        { status: 400 }
      )
    }

    // Check if username contains only allowed characters
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { 
          available: false, 
          message: 'Username can only contain letters, numbers, hyphens, and underscores' 
        },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if username exists (case-insensitive)
    const existingUser = await User.findOne({ 
      username: username.toLowerCase() 
    })

    if (existingUser) {
      // If user is logged in and checking their own username, it's available for them
      if (session && existingUser._id.toString() === session.user.id) {
        return NextResponse.json({
          available: true,
          message: 'This is your current username'
        })
      }

      return NextResponse.json({
        available: false,
        message: 'Username is already taken'
      })
    }

    return NextResponse.json({
      available: true,
      message: 'Username is available!'
    })

  } catch (error) {
    console.error('Username check error:', error)
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    )
  }
}
