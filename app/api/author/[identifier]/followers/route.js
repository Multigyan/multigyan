import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request, { params }) {
    try {
        await connectDB()

        const resolvedParams = await params
        const { identifier } = resolvedParams
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        // Find users who follow this author
        const followers = await User.find({
            following: identifier,
            isActive: true
        })
            .select('name username profilePictureUrl')
            .skip(skip)
            .limit(limit)
            .lean()

        // Get total count
        const total = await User.countDocuments({
            following: identifier,
            isActive: true
        })

        return NextResponse.json({
            success: true,
            followers: followers.map(f => ({
                ...f,
                _id: f._id.toString()
            })),
            total,
            page,
            hasMore: skip + followers.length < total
        })
    } catch (error) {
        console.error('Error fetching followers:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch followers' },
            { status: 500 }
        )
    }
}
