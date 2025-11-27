import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/authors/top - Get top authors by post count
export async function GET(request) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit')) || 6

        // Get current user session
        const session = await getServerSession(authOptions)
        const currentUserId = session?.user?.id

        // Aggregate to get authors with their post counts
        const topAuthors = await Post.aggregate([
            // Only count published posts
            { $match: { status: 'published' } },

            // Group by author and count posts
            {
                $group: {
                    _id: '$author',
                    postCount: { $sum: 1 }
                }
            },

            // Sort by post count descending
            { $sort: { postCount: -1 } },

            // Limit results
            { $limit: limit },

            // Lookup author details
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'authorDetails'
                }
            },

            // Unwind author details
            { $unwind: '$authorDetails' },

            // Project only needed fields
            {
                $project: {
                    _id: '$authorDetails._id',
                    name: '$authorDetails.name',
                    username: '$authorDetails.username',
                    profilePictureUrl: '$authorDetails.profilePictureUrl',
                    bio: '$authorDetails.bio',
                    followers: '$authorDetails.followers',
                    postCount: 1
                }
            }
        ])

        // Add isFollowing status if user is logged in
        const authorsWithFollowStatus = topAuthors.map(author => {
            const isFollowing = currentUserId && author.followers
                ? author.followers.some(followerId => followerId.toString() === currentUserId.toString())
                : false

            // Remove followers array from response
            const { followers, ...authorData } = author

            return {
                ...authorData,
                isFollowing
            }
        })

        return NextResponse.json({
            authors: authorsWithFollowStatus,
            total: authorsWithFollowStatus.length
        })

    } catch (error) {
        console.error('Error fetching top authors:', error)
        return NextResponse.json(
            { error: 'Failed to fetch top authors' },
            { status: 500 }
        )
    }
}
