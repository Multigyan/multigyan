import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import Comment from '@/models/Comment'
import logger from '@/lib/logger'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const userId = session.user.id

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is admin and if there are other admins
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin account. Please promote another user to admin first.' },
          { status: 400 }
        )
      }
    }

    // Start deletion process
    // 1. Delete user's posts (this will cascade to comments on those posts)
    const userPosts = await Post.find({ author: userId })
    const postIds = userPosts.map(post => post._id)
    
    // Delete comments on user's posts
    await Comment.deleteMany({ post: { $in: postIds } })
    
    // Delete user's posts
    await Post.deleteMany({ author: userId })
    
    // 2. Delete user's comments on other posts
    await Comment.deleteMany({ author: userId })
    
    // 3. Remove user's likes from posts
    await Post.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    )
    
    // 4. Finally, delete the user account
    await User.findByIdAndDelete(userId)

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted'
    })

  } catch (error) {
    logger.error('Account deletion error:', { error })
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again later.' },
      { status: 500 }
    )
  }
}
