// Script to sync user stats with actual data
require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  stats: {
    totalPosts: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 }
  }
}, { timestamps: true })

const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  publishedAt: Date,
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

async function syncUserStats() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected!\n')

    const username = process.argv[2]
    
    if (username) {
      // Sync specific user
      console.log(`🔄 Syncing stats for: ${username}\n`)
      await syncSingleUser(username)
    } else {
      // Sync all users
      console.log('🔄 Syncing stats for ALL users...\n')
      const users = await User.find({})
      console.log(`Found ${users.length} users\n`)
      
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        console.log(`[${i + 1}/${users.length}] Processing: ${user.name} (@${user.username})`)
        await syncSingleUser(user.username || user._id.toString())
        console.log('')
      }
    }

    console.log('\n✅ Stats sync complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

async function syncSingleUser(identifier) {
  try {
    // Find user by username or ID
    const user = await User.findOne({
      $or: [
        { username: identifier.toLowerCase() },
        { _id: mongoose.Types.ObjectId.isValid(identifier) ? identifier : null }
      ]
    })
    
    if (!user) {
      console.log(`   ❌ User not found: ${identifier}`)
      return
    }

    // Get all published posts
    const publishedPosts = await Post.find({
      author: user._id,
      status: 'published'
    })

    // Calculate stats
    let totalViews = 0
    let totalLikes = 0

    publishedPosts.forEach(post => {
      totalViews += post.views || 0
      totalLikes += post.likes ? post.likes.length : 0
    })

    // Update stats
    const oldStats = { ...user.stats }
    
    user.stats = user.stats || {}
    user.stats.totalPosts = publishedPosts.length
    user.stats.totalViews = totalViews
    user.stats.totalLikes = totalLikes
    user.stats.followersCount = user.followers ? user.followers.length : 0
    user.stats.followingCount = user.following ? user.following.length : 0

    await user.save({ validateBeforeSave: false })

    console.log('   Old Stats:', {
      posts: oldStats.totalPosts || 0,
      views: oldStats.totalViews || 0,
      likes: oldStats.totalLikes || 0,
      followers: oldStats.followersCount || 0,
      following: oldStats.followingCount || 0
    })
    
    console.log('   New Stats:', {
      posts: user.stats.totalPosts,
      views: user.stats.totalViews,
      likes: user.stats.totalLikes,
      followers: user.stats.followersCount,
      following: user.stats.followingCount
    })
    
    console.log('   ✅ Stats updated successfully!')

  } catch (error) {
    console.error('   ❌ Error syncing user:', error.message)
  }
}

syncUserStats()
