import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getUnifiedStats } from '@/lib/stats'

// Get all authors with stats
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await connectDB()

        // Get all authors with stats from centralized service
        const { authorStats } = await getUnifiedStats()

        // Get all users
        const users = await User.find()
            .select('name username email profilePictureUrl bio role isActive createdAt')
            .lean()

        // Combine user data with stats
        const authorsWithStats = users.map(user => {
            const userId = user._id.toString()
            const stats = authorStats[userId] || {
                postCount: 0,
                totalViews: 0,
                totalLikes: 0,
                latestPost: null
            }

            return {
                _id: userId,
                name: user.name,
                username: user.username,
                email: user.email,
                profilePictureUrl: user.profilePictureUrl,
                bio: user.bio,
                role: user.role,
                isActive: user.isActive !== false,
                createdAt: user.createdAt,
                postCount: stats.postCount,
                totalViews: stats.totalViews,
                totalLikes: stats.totalLikes,
                latestPost: stats.latestPost
            }
        })

        // Sort by post count descending
        authorsWithStats.sort((a, b) => b.postCount - a.postCount)

        return NextResponse.json({
            success: true,
            authors: authorsWithStats
        })

    } catch (error) {
        console.error('Error fetching authors:', error)
        return NextResponse.json(
            { error: 'Failed to fetch authors' },
            { status: 500 }
        )
    }
}
