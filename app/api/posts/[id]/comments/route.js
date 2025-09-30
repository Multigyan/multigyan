import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Post from '@/models/Post'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/posts/[id]/comments - Get all comments for a post
export async function GET(request, { params }) {
  try {
    await connectDB()
    const { id } = params

    const post = await Post.findById(id)
      .populate('comments.user', 'name profilePictureUrl')
      .select('comments allowComments')

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Sort comments by creation date (newest first)
    const sortedComments = post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return NextResponse.json({
      success: true,
      comments: sortedComments,
      allowComments: post.allowComments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/posts/[id]/comments - Add a new comment
export async function POST(request, { params }) {
  try {
    await connectDB()
    const { id } = params
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { text, guestName, guestEmail } = body

    // Validation
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      )
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Comment cannot be more than 1000 characters' },
        { status: 400 }
      )
    }

    // For guest users, require name and email
    if (!session?.user && (!guestName || !guestEmail)) {
      return NextResponse.json(
        { error: 'Name and email are required for guest comments' },
        { status: 400 }
      )
    }

    // Email validation for guests
    if (!session?.user && guestEmail && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(guestEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const post = await Post.findById(id)

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (!post.allowComments) {
      return NextResponse.json(
        { error: 'Comments are disabled for this post' },
        { status: 403 }
      )
    }

    // Create new comment
    const newComment = {
      text: text.trim(),
      isApproved: session?.user?.role === 'admin', // Auto-approve admin comments
      isReported: false,
      reportCount: 0
    }

    // Add user or guest information
    if (session?.user) {
      newComment.user = session.user.id
    } else {
      newComment.guestName = guestName.trim()
      newComment.guestEmail = guestEmail.trim()
    }

    // Add comment to post
    post.comments.push(newComment)
    await post.save()

    // Get the newly added comment with populated user data
    const updatedPost = await Post.findById(id)
      .populate('comments.user', 'name profilePictureUrl')
      .select('comments')

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1]

    return NextResponse.json({
      success: true,
      comment: addedComment,
      message: session?.user?.role === 'admin' 
        ? 'Comment posted successfully'
        : 'Comment submitted for review'
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}