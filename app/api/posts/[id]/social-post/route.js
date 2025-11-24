import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import SocialAnalytics from '@/models/SocialAnalytics'
import socialMediaService from '@/lib/socialMediaService'

/**
 * Social Media Auto-Post API
 * 
 * POST /api/posts/[id]/social-post - Manually trigger social media post
 * GET /api/posts/[id]/social-analytics - Get social analytics for post
 */

// POST - Trigger social media post
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params
        const { platforms } = await request.json()

        await connectDB()

        const post = await Post.findById(id)

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Check if user is author or admin
        const isAuthor = post.author.toString() === session.user.id
        const isAdmin = session.user.role === 'admin'

        if (!isAuthor && !isAdmin) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Post must be published
        if (post.status !== 'published') {
            return NextResponse.json(
                { error: 'Only published posts can be shared on social media' },
                { status: 400 }
            )
        }

        // Post to social media
        const results = await socialMediaService.postToAll(post)

        // Update post with social media results
        if (!post.socialMedia) {
            post.socialMedia = {}
        }
        if (!post.socialMedia.autoPost) {
            post.socialMedia.autoPost = { enabled: true, platforms: [] }
        }

        results.forEach(result => {
            const existingPlatform = post.socialMedia.autoPost.platforms.find(
                p => p.name === result.platform
            )

            if (existingPlatform) {
                existingPlatform.posted = result.success
                existingPlatform.postedAt = new Date()
                existingPlatform.postUrl = result.postUrl
                existingPlatform.error = result.error
            } else {
                post.socialMedia.autoPost.platforms.push({
                    name: result.platform,
                    posted: result.success,
                    postedAt: new Date(),
                    postUrl: result.postUrl,
                    error: result.error
                })
            }

            // Initialize social analytics
            if (result.success) {
                SocialAnalytics.updatePlatformMetrics(id, result.platform, {
                    postUrl: result.postUrl,
                    postedAt: new Date()
                })
            }
        })

        await post.save()

        const successCount = results.filter(r => r.success).length
        const failCount = results.filter(r => !r.success).length

        return NextResponse.json({
            message: `Posted to ${successCount} platform(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
            results,
            post: await Post.findById(id).lean()
        })

    } catch (error) {
        console.error('Social post error:', error)
        return NextResponse.json(
            { error: 'Failed to post to social media', details: error.message },
            { status: 500 }
        )
    }
}

// GET - Get social analytics
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params

        await connectDB()

        const analytics = await SocialAnalytics.findOne({ post: id }).lean()

        if (!analytics) {
            return NextResponse.json({
                analytics: null,
                message: 'No social analytics available yet'
            })
        }

        return NextResponse.json({ analytics })

    } catch (error) {
        console.error('Get social analytics error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch social analytics', details: error.message },
            { status: 500 }
        )
    }
}
