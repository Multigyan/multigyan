import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Newsletter from '@/models/Newsletter'

// GET - Get specific newsletter subscriber
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const subscriber = await Newsletter.findById(params.id)
      .populate('preferences.categories', 'name slug color')

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriber
    })

  } catch (error) {
    console.error('Error fetching newsletter subscriber:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update newsletter subscriber
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { action, preferences, email } = await request.json()

    const subscriber = await Newsletter.findById(params.id)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'unsubscribe':
        await subscriber.unsubscribe()
        break

      case 'resubscribe':
        await subscriber.resubscribe()
        break

      case 'update_preferences':
        if (preferences) {
          subscriber.preferences = {
            ...subscriber.preferences,
            ...preferences
          }
          await subscriber.save()
        }
        break

      case 'update_email':
        if (email && email !== subscriber.email) {
          // Check if new email already exists
          const existingSubscriber = await Newsletter.findOne({ 
            email: email.toLowerCase().trim(),
            _id: { $ne: params.id }
          })
          
          if (existingSubscriber) {
            return NextResponse.json(
              { error: 'Email already exists' },
              { status: 409 }
            )
          }
          
          subscriber.email = email.toLowerCase().trim()
          await subscriber.save()
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Populate categories for response
    await subscriber.populate('preferences.categories', 'name slug color')

    return NextResponse.json({
      success: true,
      message: `Subscriber ${action}d successfully`,
      subscriber
    })

  } catch (error) {
    console.error('Error updating newsletter subscriber:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific newsletter subscriber
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const subscriber = await Newsletter.findByIdAndDelete(params.id)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    )
  }
}
