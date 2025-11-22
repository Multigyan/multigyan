import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

/**
 * GET /api/posts/revisions/pending
 * 
 * Fetch all published posts that have pending revisions
 * This is optimized to only fetch posts with revisions, not all published posts
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

        // Get search parameter
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''

        // Build query for posts with pending revisions
        let query = {
            status: 'published',
            hasRevision: true,
            'revision.status': 'pending'
        }

        // Add search if provided
        if (search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'author.name': { $regex: search, $options: 'i' } }
            ]
        }

        // Fetch posts with revisions
        const postsWithRevisions = await Post.find(query)
            .populate('author', 'name email profilePictureUrl')
            .populate('category', 'name color')
            .select('title slug category author revision readingTime createdAt updatedAt')
            .sort({ 'revision.updatedAt': -1 })
            .lean()

        return NextResponse.json({
            success: true,
            posts: postsWithRevisions,
            count: postsWithRevisions.length
        })

    } catch (error) {
        console.error('Error fetching pending revisions:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
