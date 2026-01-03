import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import { analyzeContentQuality } from '@/lib/content-quality'

/**
 * POST /api/content/analyze
 * Analyze content quality for a specific post
 */
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { postId, content, contentType } = await request.json()

        if (!postId && !content) {
            return NextResponse.json(
                { error: 'Post ID or content required' },
                { status: 400 }
            )
        }

        await connectDB()

        let post
        if (postId) {
            post = await Post.findById(postId)
                .populate('category', 'name slug')
                .lean()

            if (!post) {
                return NextResponse.json(
                    { error: 'Post not found' },
                    { status: 404 }
                )
            }
        } else {
            // Analyze provided content (for editor preview)
            post = {
                content,
                seoKeywords: [],
                tags: []
            }
        }

        // Determine content type
        const type = contentType ||
            (post.tags?.some(t => t.toLowerCase().includes('news')) ? 'news'
                : post.tags?.some(t => t.toLowerCase().includes('diy')) ? 'diy'
                    : post.tags?.some(t => t.toLowerCase().includes('recipe')) ? 'recipe'
                        : 'blog')

        const analysis = analyzeContentQuality(post, type)

        return NextResponse.json({
            success: true,
            analysis
        })

    } catch (error) {
        console.error('Content analysis error:', error)
        return NextResponse.json(
            { error: 'Analysis failed', details: error.message },
            { status: 500 }
        )
    }
}
