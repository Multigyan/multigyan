import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const user = await User.findById(session.user.id).select('settings')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return default settings if user doesn't have any saved
    const defaultSettings = {
      emailNotifications: true,
      commentNotifications: true,
      likeNotifications: false,
      newFollowerNotifications: true,
      weeklyDigest: true,
      profileVisibility: true,
      showEmail: false,
      showJoinDate: true,
      allowFollowing: true,
      autoSaveDrafts: true,
      defaultPostVisibility: 'public',
      allowComments: true,
      moderateComments: false,
      theme: 'system',
      language: 'en',
      postsPerPage: 10,
      twoFactorEnabled: false,
      loginAlerts: true
    }

    const userSettings = user.settings || defaultSettings

    return NextResponse.json({
      success: true,
      settings: { ...defaultSettings, ...userSettings }
    })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
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

    const { settings } = await request.json()

    if (!settings) {
      return NextResponse.json({ error: 'Settings data required' }, { status: 400 })
    }

    await connectDB()
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: { 
          settings: settings,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('settings')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
