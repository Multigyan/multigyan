import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'

// ⚡ OPTIMIZATION: Stats API for profile page
export async function GET(request, { params }) {
    try {
        const resolvedParams = await params
        const { userId } = resolvedParams

        await connectDB()

        // Fetch user and stats in parallel
        const [user, publishedPosts] = await Promise.all([
            User.findById(userId).select('followers following').lean(),
            Post.find({ author: userId, status: 'published' })
                .select('views likes')
                .lean()
        ])

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Calculate stats
        const totalViews = publishedPosts.reduce((sum, post) => sum + (post.views || 0), 0)
        const totalLikes = publishedPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)

        const stats = {
            totalPosts: publishedPosts.length,
            totalViews,
            totalLikes,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0
        }

        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            }
        })
    } catch (error) {
        console.error('Error fetching user stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
