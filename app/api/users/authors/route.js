import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()

    // Get count of all users with role 'author' or 'admin'
    const total = await User.countDocuments({ 
      role: { $in: ['author', 'admin'] } 
    })

    return NextResponse.json({ 
      success: true,
      total 
    })

  } catch (error) {
    console.error('Error fetching authors count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors count' },
      { status: 500 }
    )
  }
}
