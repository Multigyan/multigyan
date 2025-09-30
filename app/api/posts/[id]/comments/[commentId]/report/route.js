import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Post from '@/models/Post'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// PATCH /api/posts/[id]/comments/[commentId]/report - Report a comment
export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const { id, commentId } = params
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to report comments' },
        { status: 401 }
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

    // Check if comment is already reported
    if (comment.isReported) {
      // Increment report count
      comment.reportCount = (comment.reportCount || 0) + 1
    } else {
      // First report
      comment.isReported = true
      comment.reportCount = 1
    }

    await post.save()

    return NextResponse.json({
      success: true,
      message: 'Comment reported successfully. Our moderators will review it.',
      reportCount: comment.reportCount
    })

  } catch (error) {
    console.error('Error reporting comment:', error)
    return NextResponse.json(
      { error: 'Failed to report comment' },
      { status: 500 }
    )
  }
}