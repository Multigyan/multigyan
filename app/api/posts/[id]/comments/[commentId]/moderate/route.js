import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Post from '@/models/Post'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// PATCH /api/posts/[id]/comments/[commentId]/moderate - Approve or reject a comment
export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const { id, commentId } = params
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can moderate comments' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (approve/reject) is required' },
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

    const comment = post.comments.id(commentId)

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      comment.isApproved = true
    } else if (action === 'reject') {
      // Remove the comment from the post
      post.comments.pull(commentId)
    }

    await post.save()

    return NextResponse.json({
      success: true,
      message: `Comment ${action}d successfully`
    })

  } catch (error) {
    console.error('Error moderating comment:', error)
    return NextResponse.json(
      { error: 'Failed to moderate comment' },
      { status: 500 }
    )
  }
}