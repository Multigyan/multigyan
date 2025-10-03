import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // Get all users with basic info
    const users = await User.find({})
      .select('name email role isActive emailVerified createdAt lastLoginAt')
      .sort({ createdAt: -1 })

    // Get admin count
    const adminCount = await User.getAdminCount()
    const maxAdmins = process.env.MAX_ADMINS || 3

    return NextResponse.json({
      users,
      adminCount,
      maxAdmins,
      canPromoteMore: adminCount < maxAdmins
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    await connectDB()

    let updatedUser

    if (action === 'promote') {
      // Check if we can promote more admins
      const canPromote = await User.canPromoteToAdmin()
      if (!canPromote) {
        return NextResponse.json(
          { error: 'Maximum number of admins reached' },
          { status: 400 }
        )
      }

      updatedUser = await User.promoteToAdmin(userId, session.user.id)
    } else if (action === 'demote') {
      updatedUser = await User.demoteToAuthor(userId, session.user.id)
    } else if (action === 'activate') {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { isActive: true },
        { new: true }
      )
    } else if (action === 'deactivate') {
      // Prevent deactivating yourself
      if (userId === session.user.id) {
        return NextResponse.json(
          { error: 'Cannot deactivate your own account' },
          { status: 400 }
        )
      }

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `User ${action}d successfully`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    
    // Handle specific error messages
    if (error.message.includes('Cannot demote yourself') || 
        error.message.includes('Cannot deactivate your own account')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Handle validation errors (bio length, etc.)
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: `Validation failed: ${validationErrors.join(', ')}` },
        { status: 400 }
      )
    }

    // Handle user not found
    if (error.message.includes('User not found')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to update user. Please try again.' },
      { status: 500 }
    )
  }
}