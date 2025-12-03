import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

// POST /api/users/[id]/follow - Toggle follow status
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        if (session.user.id === params.id) {
            return NextResponse.json(
                { error: 'Cannot follow yourself' },
                { status: 400 }
            )
        }

        await dbConnect()

        const currentUser = await User.findById(session.user.id)
        const targetUser = await User.findById(params.id)

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const isFollowing = currentUser.following?.includes(params.id)

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(session.user.id, {
                $pull: { following: params.id }
            })
            await User.findByIdAndUpdate(params.id, {
                $pull: { followers: session.user.id }
            })
        } else {
            // Follow
            await User.findByIdAndUpdate(session.user.id, {
                $addToSet: { following: params.id }
            })
            await User.findByIdAndUpdate(params.id, {
                $addToSet: { followers: session.user.id }
            })
        }

        // Get updated follower count
        const updatedUser = await User.findById(params.id).select('followers')

        return NextResponse.json({
            isFollowing: !isFollowing,
            followerCount: updatedUser.followers?.length || 0
        })
    } catch (error) {
        console.error('Error toggling follow:', error)
        return NextResponse.json(
            { error: 'Failed to update follow status' },
            { status: 500 }
        )
    }
}
