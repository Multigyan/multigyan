import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'

// POST - Handle post actions (approve, reject, like, unlike, submit)
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { action, reason } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const post = await Post.findById(params.id)
      .populate('author', 'name email')
      .populate('category', 'name')
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const isAuthor = post.author._id.toString() === session.user.id
    const isAdmin = session.user.role === 'admin'

    switch (action) {
      case 'approve':
        // Only admins can approve posts
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Unauthorized - Admin access required' },
            { status: 403 }
          )
        }

        if (post.status !== 'pending_review') {
          return NextResponse.json(
            { error: 'Post is not pending review' },
            { status: 400 }
          )
        }

        await post.approve(session.user.id)
        await Category.incrementPostCount(post.category._id)

        return NextResponse.json({
          message: 'Post approved and published successfully',
          post: {
            id: post._id,
            title: post.title,
            status: post.status,
            publishedAt: post.publishedAt
          }
        })

      case 'reject':
        // Only admins can reject posts
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Unauthorized - Admin access required' },
            { status: 403 }
          )
        }

        if (post.status !== 'pending_review') {
          return NextResponse.json(
            { error: 'Post is not pending review' },
            { status: 400 }
          )
        }

        if (!reason || reason.trim().length === 0) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          )
        }

        await post.reject(session.user.id, reason.trim())

        return NextResponse.json({
          message: 'Post rejected successfully',
          post: {
            id: post._id,
            title: post.title,
            status: post.status,
            rejectionReason: post.rejectionReason
          }
        })

      case 'submit':
        // Only post authors can submit for review
        if (!isAuthor) {
          return NextResponse.json(
            { error: 'Unauthorized - You can only submit your own posts' },
            { status: 403 }
          )
        }

        if (post.status !== 'draft' && post.status !== 'rejected') {
          return NextResponse.json(
            { error: 'Post must be in draft or rejected status to submit for review' },
            { status: 400 }
          )
        }

        await post.submitForReview()

        return NextResponse.json({
          message: 'Post submitted for review successfully',
          post: {
            id: post._id,
            title: post.title,
            status: post.status
          }
        })

      case 'like':
        // Any authenticated user can like a published post
        if (post.status !== 'published') {
          return NextResponse.json(
            { error: 'Can only like published posts' },
            { status: 400 }
          )
        }

        await post.addLike(session.user.id)

        return NextResponse.json({
          message: 'Post liked successfully',
          likeCount: post.likeCount
        })

      case 'unlike':
        // Any authenticated user can unlike a post they previously liked
        if (post.status !== 'published') {
          return NextResponse.json(
            { error: 'Can only unlike published posts' },
            { status: 400 }
          )
        }

        await post.removeLike(session.user.id)

        return NextResponse.json({
          message: 'Post unliked successfully',
          likeCount: post.likeCount
        })

      case 'feature':
        // Only admins can feature/unfeature posts
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Unauthorized - Admin access required' },
            { status: 403 }
          )
        }

        post.isFeatured = !post.isFeatured
        await post.save()

        return NextResponse.json({
          message: `Post ${post.isFeatured ? 'featured' : 'unfeatured'} successfully`,
          isFeatured: post.isFeatured
        })

      case 'toggle_comments':
        // Authors and admins can toggle comments
        if (!isAuthor && !isAdmin) {
          return NextResponse.json(
            { error: 'Unauthorized - You can only manage your own posts' },
            { status: 403 }
          )
        }

        post.allowComments = !post.allowComments
        await post.save()

        return NextResponse.json({
          message: `Comments ${post.allowComments ? 'enabled' : 'disabled'} successfully`,
          allowComments: post.allowComments
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error performing post action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}