import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

// GET /api/users/[id]/follow-status - Get follow status and follower count
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        await dbConnect()

        const targetUser = await User.findById(params.id)
            .select('followers')
            .lean()

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const isFollowing = session?.user?.id
            ? targetUser.followers?.some(id => id.toString() === session.user.id)
            : false

        return NextResponse.json({
            isFollowing,
            followerCount: targetUser.followers?.length || 0
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        })
    } catch (error) {
        console.error('Error fetching follow status:', error)
        return NextResponse.json(
            { error: 'Failed to fetch follow status' },
            { status: 500 }
        )
    }
}
