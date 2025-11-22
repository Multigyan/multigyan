import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

/**
 * GET /api/posts/revisions/pending
 * 
 * Fetch published posts that have pending revisions with pagination
 * Only includes actual revisions (not initial post creation)
 */
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            )
        }

        await connectDB()

        // Get pagination and search parameters
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit
        const search = searchParams.get('search') || ''

        // Build query for posts with pending revisions
        // Only include posts where revision exists AND is different from original
        let query = {
            status: 'published',
            hasRevision: true,
            'revision.status': 'pending',
            // Ensure revision content is different from current content
            $expr: {
                $ne: ['$content', '$revision.content']
            }
        }

        // Add search if provided
        if (search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'author.name': { $regex: search, $options: 'i' } }
            ]
        }

        // Get total count and paginated posts in parallel
        const [total, postsWithRevisions] = await Promise.all([
            Post.countDocuments(query),
            Post.find(query)
                .populate('author', 'name email profilePictureUrl')
                .populate('category', 'name color')
                .select('title slug category author revision content readingTime createdAt updatedAt')
                .sort({ 'revision.updatedAt': -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ])

        return NextResponse.json({
            success: true,
            posts: postsWithRevisions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + postsWithRevisions.length < total
            }
        })

    } catch (error) {
        console.error('Error fetching pending revisions:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
