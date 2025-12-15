import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
    submitUrlToIndexNow,
    submitUrlsToIndexNow,
    submitPostToIndexNow,
    submitCategoryToIndexNow,
    submitStaticPagesToIndexNow,
    submitAllPostsToIndexNow
} from '@/lib/indexnow'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

/**
 * POST /api/indexnow
 * Submit URLs to IndexNow API
 * 
 * Body options:
 * - { type: 'url', url: 'https://...' } - Submit single URL
 * - { type: 'urls', urls: ['https://...'] } - Submit multiple URLs
 * - { type: 'post', slug: 'post-slug' } - Submit blog post
 * - { type: 'category', slug: 'category-slug' } - Submit category
 * - { type: 'static' } - Submit all static pages
 * - { type: 'all-posts' } - Submit all published posts (admin only)
 */
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        // Only authenticated users can submit to IndexNow
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { type, url, urls, slug } = body

        let result

        switch (type) {
            case 'url':
                if (!url) {
                    return NextResponse.json(
                        { error: 'URL is required' },
                        { status: 400 }
                    )
                }
                result = await submitUrlToIndexNow(url)
                break

            case 'urls':
                if (!urls || !Array.isArray(urls)) {
                    return NextResponse.json(
                        { error: 'URLs array is required' },
                        { status: 400 }
                    )
                }
                result = await submitUrlsToIndexNow(urls)
                break

            case 'post':
                if (!slug) {
                    return NextResponse.json(
                        { error: 'Post slug is required' },
                        { status: 400 }
                    )
                }
                result = await submitPostToIndexNow(slug)
                break

            case 'category':
                if (!slug) {
                    return NextResponse.json(
                        { error: 'Category slug is required' },
                        { status: 400 }
                    )
                }
                result = await submitCategoryToIndexNow(slug)
                break

            case 'static':
                result = await submitStaticPagesToIndexNow()
                break

            case 'all-posts':
                // Only admins can submit all posts
                if (session.user.role !== 'admin') {
                    return NextResponse.json(
                        { error: 'Admin access required' },
                        { status: 403 }
                    )
                }

                await connectDB()
                const posts = await Post.find({ status: 'published' })
                    .select('slug')
                    .lean()

                result = await submitAllPostsToIndexNow(posts)
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid type. Must be: url, urls, post, category, static, or all-posts' },
                    { status: 400 }
                )
        }

        return NextResponse.json(result)

    } catch (error) {
        console.error('IndexNow API Error:', error)
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        )
    }
}

/**
 * GET /api/indexnow
 * Get IndexNow configuration info
 */
export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'
    const apiKey = '66ec4f211ec9478489247dad39fbc8de'

    return NextResponse.json({
        enabled: true,
        siteUrl,
        keyLocation: `${siteUrl}/${apiKey}.txt`,
        endpoint: 'https://api.indexnow.org/IndexNow',
        supportedEngines: ['Bing', 'Yahoo', 'Yandex', 'Naver', 'Seznam.cz']
    })
}

