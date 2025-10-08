// Utility function to update user stats
import { connectDB } from './mongodb'
import User from '@/models/User'
import Post from '@/models/Post'

export async function updateUserStats(userId) {
  try {
    await connectDB()
    
    // Get all published posts
    const publishedPosts = await Post.find({
      author: userId,
      status: 'published'
    })
    
    // Calculate stats
    let totalViews = 0
    let totalLikes = 0
    
    publishedPosts.forEach(post => {
      totalViews += post.views || 0
      totalLikes += post.likes ? post.likes.length : 0
    })
    
    // Get user
    const user = await User.findById(userId)
    
    if (!user) {
      console.error('User not found:', userId)
      return false
    }
    
    // Update stats
    user.stats = user.stats || {}
    user.stats.totalPosts = publishedPosts.length
    user.stats.totalViews = totalViews
    user.stats.totalLikes = totalLikes
    user.stats.followersCount = user.followers ? user.followers.length : 0
    user.stats.followingCount = user.following ? user.following.length : 0
    
    await user.save({ validateBeforeSave: false })
    
    console.log(`✅ Stats updated for user: ${user.name}`)
    return true
    
  } catch (error) {
    console.error('Error updating user stats:', error)
    return false
  }
}

// Batch update all users
export async function updateAllUserStats() {
  try {
    await connectDB()
    
    const users = await User.find({})
    console.log(`Updating stats for ${users.length} users...`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const user of users) {
      const success = await updateUserStats(user._id)
      if (success) {
        successCount++
      } else {
        errorCount++
      }
    }
    
    console.log(`\nCompleted: ${successCount} successful, ${errorCount} errors`)
    return { successCount, errorCount }
    
  } catch (error) {
    console.error('Error in batch update:', error)
    return { successCount: 0, errorCount: 0 }
  }
}
