import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import DraftReview from '@/models/DraftReview'

/**
 * Draft Review API
 * 
 * GET /api/posts/[id]/reviews - Get all reviews for a post
 * POST /api/posts/[id]/reviews - Request a new review
 * PUT /api/posts/[id]/reviews - Update review status/add comments
 */

// GET - Get all reviews for a post
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

        // Verify post exists
        const post = await Post.findById(id).lean()

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Get all reviews for this post
        const reviews = await DraftReview.find({ post: id })
            .populate('reviewer', 'name email profilePictureUrl')
            .populate('requestedBy', 'name email')
            .populate('comments.resolvedBy', 'name')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({ reviews })

    } catch (error) {
        console.error('Get reviews error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch reviews', details: error.message },
            { status: 500 }
        )
    }
}

// POST - Request a new review
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
        const { reviewerId, message } = await request.json()

        if (!reviewerId) {
            return NextResponse.json(
                { error: 'Reviewer ID is required' },
                { status: 400 }
            )
        }

        await connectDB()

        // Verify post exists and user has access
        const post = await Post.findById(id).lean()

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Check if user is author or co-author
        const isAuthor = post.author.toString() === session.user.id
        const isCoAuthor = post.coAuthors?.some(id => id.toString() === session.user.id)

        if (!isAuthor && !isCoAuthor) {
            return NextResponse.json(
                { error: 'Only authors can request reviews' },
                { status: 403 }
            )
        }

        // Create review request
        const review = await DraftReview.requestReview(
            id,
            reviewerId,
            session.user.id
        )

        // TODO: Send email notification to reviewer
        // await sendReviewRequestEmail(reviewerId, post, message)

        return NextResponse.json({
            message: 'Review requested successfully',
            review: await DraftReview.findById(review._id)
                .populate('reviewer', 'name email profilePictureUrl')
                .populate('requestedBy', 'name email')
                .lean()
        })

    } catch (error) {
        console.error('Request review error:', error)
        return NextResponse.json(
            { error: 'Failed to request review', details: error.message },
            { status: 500 }
        )
    }
}

// PUT - Update review (add comment, complete review, resolve comment)
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params
        const { reviewId, action, data } = await request.json()

        if (!reviewId || !action) {
            return NextResponse.json(
                { error: 'Review ID and action are required' },
                { status: 400 }
            )
        }

        await connectDB()

        const review = await DraftReview.findById(reviewId)

        if (!review) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            )
        }

        // Handle different actions
        switch (action) {
            case 'add-comment':
                if (!data.content) {
                    return NextResponse.json(
                        { error: 'Comment content is required' },
                        { status: 400 }
                    )
                }
                review.addComment(data.content, data.position, data.selectedText)
                break

            case 'resolve-comment':
                if (!data.commentId) {
                    return NextResponse.json(
                        { error: 'Comment ID is required' },
                        { status: 400 }
                    )
                }
                review.resolveComment(data.commentId, session.user.id)
                break

            case 'complete-review':
                if (!data.status) {
                    return NextResponse.json(
                        { error: 'Review status is required' },
                        { status: 400 }
                    )
                }
                review.completeReview(data.status, data.feedback)
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

        await review.save()

        return NextResponse.json({
            message: 'Review updated successfully',
            review: await DraftReview.findById(reviewId)
                .populate('reviewer', 'name email profilePictureUrl')
                .populate('requestedBy', 'name email')
                .populate('comments.resolvedBy', 'name')
                .lean()
        })

    } catch (error) {
        console.error('Update review error:', error)
        return NextResponse.json(
            { error: 'Failed to update review', details: error.message },
            { status: 500 }
        )
    }
}
