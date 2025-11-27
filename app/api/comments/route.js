import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import User from '@/models/User'
import Notification from '@/models/Notification'
import { commentRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import logger from '@/lib/logger'

// GET - Get comments for a specific post
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true'

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const post = await Post.findById(postId)
      .populate('comments.author', 'name profilePictureUrl')

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get session to check if user is admin
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin'

    let comments
    if (includeUnapproved && isAdmin) {
      // Admin can see all comments
      comments = post.comments
    } else {
      // Regular users see only approved comments
      comments = post.comments.filter(comment => comment.isApproved)
    }

    // Structure comments with replies
    const topLevelComments = comments.filter(comment => !comment.parentComment)
    const replies = comments.filter(comment => comment.parentComment)

    const commentsWithReplies = topLevelComments.map(comment => {
      const commentReplies = replies.filter(reply =>
        reply.parentComment && reply.parentComment.equals(comment._id)
      )
      return {
        ...comment.toObject(),
        replies: commentReplies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      }
    })

    const sortedComments = commentsWithReplies.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )

    return NextResponse.json({
      success: true,
      comments: sortedComments,
      stats: post.getCommentStats()
    })

  } catch (error) {
    logger.error('Error fetching comments:', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add a new comment or reply
export async function POST(request) {
  // Rate limiting: 10 comments per minute
  const rateLimitResult = await commentRateLimit(request)
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    const { postId, content, parentComment, guestName, guestEmail } = await request.json()

    // Validation
    if (!postId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment cannot be more than 1000 characters' },
        { status: 400 }
      )
    }

    // Check if post exists and allows comments
    const post = await Post.findById(postId).populate('author', '_id name')
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

    // If it's a reply, verify parent comment exists
    let parentCommentAuthor = null
    if (parentComment) {
      const parentExists = post.comments.find(comment =>
        comment._id.equals(parentComment)
      )
      if (!parentExists) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
      parentCommentAuthor = parentExists.author
    }

    // Prepare comment data
    const commentData = {
      content: content.trim(),
      parentComment: parentComment || null,
      isApproved: false // Comments need approval by default
    }

    if (session?.user) {
      // Logged in user
      commentData.author = session.user.id

      // Auto-approve admin comments
      if (session.user.role === 'admin') {
        commentData.isApproved = true
      }
    } else {
      // Guest comment
      if (!guestName?.trim() || !guestEmail?.trim()) {
        return NextResponse.json(
          { error: 'Guest name and email are required for guest comments' },
          { status: 400 }
        )
      }

      // Validate guest email
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
      if (!emailRegex.test(guestEmail)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' },
          { status: 400 }
        )
      }

      commentData.guestName = guestName.trim()
      commentData.guestEmail = guestEmail.trim()
    }

    // Add comment to post
    await post.addComment(commentData)

    // Get the newly added comment (last one in array)
    const newComment = post.comments[post.comments.length - 1]

    // Populate author if it's a user comment
    if (newComment.author) {
      await post.populate('comments.author', 'name profilePictureUrl')
    }

    // CREATE NOTIFICATION
    if (session?.user && commentData.isApproved) {
      try {
        if (parentComment && parentCommentAuthor) {
          // Notification for reply to comment
          await Notification.createNotification({
            recipient: parentCommentAuthor,
            sender: session.user.id,
            type: 'reply_comment',
            post: postId,
            comment: newComment._id,
            message: `${session.user.name} replied to your comment`,
            link: `/blog/${post.slug}#comment-${newComment._id}`
          })
        } else if (post.author && post.author._id) {
          // Notification for comment on post (only if post has author)
          await Notification.createNotification({
            recipient: post.author._id,
            sender: session.user.id,
            type: 'comment_post',
            post: postId,
            comment: newComment._id,
            message: `${session.user.name} commented on your post`,
            link: `/blog/${post.slug}#comment-${newComment._id}`
          })
        }
      } catch (notifError) {
        logger.error('Error creating notification:', { error: notifError })
        // Don't fail the comment creation if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: commentData.isApproved
        ? 'Comment added successfully'
        : 'Comment submitted for approval',
      comment: newComment,
      needsApproval: !commentData.isApproved
    }, { status: 201 })

  } catch (error) {
    logger.error('Error adding comment:', { error })
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

// PUT - Update comment (like/unlike, approve, edit)
export async function PUT(request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { postId, commentId, action, content } = await request.json()

    if (!postId || !commentId || !action) {
      return NextResponse.json(
        { error: 'Post ID, comment ID, and action are required' },
        { status: 400 }
      )
    }

    const post = await Post.findById(postId).populate('author', '_id name')
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

    switch (action) {
      case 'like':
        await post.toggleCommentLike(commentId, session.user.id)

        // CREATE NOTIFICATION for comment like
        if (comment.author && !comment.likes.includes(session.user.id)) {
          try {
            await Notification.createNotification({
              recipient: comment.author,
              sender: session.user.id,
              type: 'like_comment',
              post: postId,
              comment: commentId,
              message: `${session.user.name} liked your comment`,
              link: `/blog/${post.slug}#comment-${commentId}`
            })
          } catch (notifError) {
            logger.error('Error creating like notification:', { error: notifError })
          }
        }
        break

      case 'approve':
        if (session.user.role !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }
        await post.approveComment(commentId)

        // CREATE NOTIFICATION when comment is approved
        if (comment.author) {
          try {
            await Notification.createNotification({
              recipient: comment.author,
              sender: session.user.id,
              type: 'post_published', // Reusing this type
              post: postId,
              comment: commentId,
              message: 'Your comment was approved and published',
              link: `/blog/${post.slug}#comment-${commentId}`
            })
          } catch (notifError) {
            logger.error('Error creating approval notification:', { error: notifError })
          }
        }
        break

      case 'edit':
        // Check if user owns the comment or is admin
        if (!comment.author?.equals(session.user.id) && session.user.role !== 'admin') {
          return NextResponse.json(
            { error: 'You can only edit your own comments' },
            { status: 403 }
          )
        }

        if (!content?.trim()) {
          return NextResponse.json(
            { error: 'Content is required for editing' },
            { status: 400 }
          )
        }

        comment.editContent(content.trim())
        await post.save()
        break

      case 'report':
        comment.report()
        await post.save()
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Comment ${action}ed successfully`,
      comment: comment
    })

  } catch (error) {
    logger.error('Error updating comment:', { error })
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// DELETE - Delete comment (admin only)
export async function DELETE(request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const commentId = searchParams.get('commentId')

    if (!postId || !commentId) {
      return NextResponse.json(
        { error: 'Post ID and comment ID are required' },
        { status: 400 }
      )
    }

    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    await post.deleteComment(commentId)

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })

  } catch (error) {
    logger.error('Error deleting comment:', { error })
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
