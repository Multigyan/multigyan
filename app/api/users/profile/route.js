import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const user = await User.findById(session.user.id).select('-password')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: user.profile
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Validate email format if provided
    if (data.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate username if provided
    if (data.username) {
      const username = data.username.trim()
      
      // Check length
      if (username.length < 3) {
        return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
      }
      if (username.length > 30) {
        return NextResponse.json({ error: 'Username cannot be more than 30 characters' }, { status: 400 })
      }
      
      // Check format
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return NextResponse.json({ 
          error: 'Username can only contain letters, numbers, hyphens, and underscores' 
        }, { status: 400 })
      }
      
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: session.user.id } // Exclude current user
      })
      
      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })
      }
    }

    await connectDB()
    
    // Prepare update data
    const updateData = {
      name: data.name.trim(),
      username: data.username?.trim().toLowerCase() || undefined,
      bio: data.bio?.trim() || '',
      profilePictureUrl: data.profilePictureUrl || null,
      twitterHandle: data.twitterHandle?.trim() || '',
      linkedinUrl: data.linkedinUrl?.trim() || '',
      website: data.website?.trim() || '',
      updatedAt: new Date()
    }
    
    // Remove username from update if it's empty
    if (!updateData.username) {
      delete updateData.username
    }

    // Don't allow email changes for security reasons
    // Email changes should go through a separate verification process

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.profile
    })

  } catch (error) {
    console.error('Profile update error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
