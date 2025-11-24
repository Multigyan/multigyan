import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

/**
 * Collaborative Editing API
 * 
 * POST /api/posts/[id]/lock - Lock post for editing
 * DELETE /api/posts/[id]/lock - Unlock post
 * POST /api/posts/[id]/autosave - Auto-save draft
 * GET /api/posts/[id]/editing-status - Check editing status
 */

// POST - Lock post for editing
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

        await connectDB()

        const post = await Post.findById(id)

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Check if already locked by someone else
        if (post.editing?.isLocked && post.editing.lockedBy?.toString() !== session.user.id) {
            const lockAge = Date.now() - new Date(post.editing.lockedAt).getTime()
            const lockTimeout = 30 * 60 * 1000 // 30 minutes

            // Auto-unlock if lock is older than timeout
            if (lockAge > lockTimeout) {
                post.editing.isLocked = false
                post.editing.lockedBy = null
            } else {
                return NextResponse.json(
                    {
                        error: 'Post is currently being edited by another user',
                        lockedBy: post.editing.lockedBy,
                        lockedAt: post.editing.lockedAt
                    },
                    { status: 409 }
                )
            }
        }

        // Lock the post
        post.editing = {
            isLocked: true,
            lockedBy: session.user.id,
            lockedAt: new Date()
        }

        await post.save()

        return NextResponse.json({
            message: 'Post locked for editing',
            editing: post.editing
        })

    } catch (error) {
        console.error('Lock post error:', error)
        return NextResponse.json(
            { error: 'Failed to lock post', details: error.message },
            { status: 500 }
        )
    }
}

// DELETE - Unlock post
export async function DELETE(request, { params }) {
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

        const post = await Post.findById(id)

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Only the user who locked it or admin can unlock
        const isLocker = post.editing?.lockedBy?.toString() === session.user.id
        const isAdmin = session.user.role === 'admin'

        if (!isLocker && !isAdmin) {
            return NextResponse.json(
                { error: 'You cannot unlock this post' },
                { status: 403 }
            )
        }

        // Unlock the post
        post.editing = {
            isLocked: false,
            lockedBy: null,
            lockedAt: null
        }

        await post.save()

        return NextResponse.json({
            message: 'Post unlocked'
        })

    } catch (error) {
        console.error('Unlock post error:', error)
        return NextResponse.json(
            { error: 'Failed to unlock post', details: error.message },
            { status: 500 }
        )
    }
}

// GET - Get editing status
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

        const post = await Post.findById(id)
            .select('editing')
            .populate('editing.lockedBy', 'name email profilePictureUrl')
            .lean()

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            editing: post.editing || { isLocked: false }
        })

    } catch (error) {
        console.error('Get editing status error:', error)
        return NextResponse.json(
            { error: 'Failed to get editing status', details: error.message },
            { status: 500 }
        )
    }
}
