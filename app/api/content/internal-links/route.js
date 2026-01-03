import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import { findRelatedPosts, injectInternalLinks } from '@/lib/internal-linking'

/**
 * POST /api/content/internal-links
 * Find and inject internal links for a post
 */
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== 'admin' && session.user.role !== 'author')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { postId, autoInject, maxLinks } = await request.json()

        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID required' },
                { status: 400 }
            )
        }

        await connectDB()

        const post = await Post.findById(postId)
            .populate('category', 'name slug')
            .populate('author', 'name username')

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Check authorization - only post author or admin can modify
        if (session.user.role !== 'admin' && post.author._id.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to edit this post' },
                { status: 403 }
            )
        }

        // Find related posts
        const relatedPosts = await findRelatedPosts(post, maxLinks || 5)

        if (autoInject) {
            // Automatically inject links and save
            const { content, linksAdded } = injectInternalLinks(
                post.content,
                relatedPosts,
                maxLinks || 5
            )

            if (linksAdded > 0) {
                post.content = content
                post.updatedAt = new Date()
                await post.save()

                return NextResponse.json({
                    success: true,
                    message: `Added ${linksAdded} internal links`,
                    linksAdded,
                    relatedPosts: relatedPosts.slice(0, linksAdded)
                })
            } else {
                return NextResponse.json({
                    success: true,
                    message: 'No suitable link opportunities found',
                    linksAdded: 0,
                    relatedPosts: []
                })
            }
        } else {
            // Just return suggestions, don't auto-inject
            return NextResponse.json({
                success: true,
                suggestions: relatedPosts.map(p => ({
                    _id: p._id,
                    title: p.title,
                    slug: p.slug,
                    category: p.category?.name,
                    relevanceScore: p.relevanceScore,
                    matchType: p.matchType,
                    url: `/blog/${p.slug}`
                }))
            })
        }

    } catch (error) {
        console.error('Internal linking error:', error)
        return NextResponse.json(
            { error: 'Failed to process internal links', details: error.message },
            { status: 500 }
        )
    }
}

/**
 * GET /api/content/internal-links?postId=xxx
 * Get internal link suggestions for a post
 */
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const postId = searchParams.get('postId')

        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID required' },
                { status: 400 }
            )
        }

        await connectDB()

        const post = await Post.findById(postId)
            .populate('category', 'name slug')
            .populate('author', 'name username')

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        const relatedPosts = await findRelatedPosts(post, 10)

        return NextResponse.json({
            success: true,
            suggestions: relatedPosts.map(p => ({
                _id: p._id,
                title: p.title,
                slug: p.slug,
                category: p.category?.name,
                excerpt: p.excerpt,
                relevanceScore: p.relevanceScore,
                matchType: p.matchType,
                url: `/blog/${p.slug}`,
                publishedAt: p.publishedAt
            }))
        })

    } catch (error) {
        console.error('Internal linking suggestions error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch suggestions', details: error.message },
            { status: 500 }
        )
    }
}
