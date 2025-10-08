// Script to debug user posts and stats
require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
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

async function checkUserPosts() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected!\n')

    // Check a specific user (replace with actual username)
    const username = process.argv[2] || 'vishal_kumar_sharma'
    
    console.log(`📊 Checking data for username: ${username}\n`)
    
    const user = await User.findOne({ username: username.toLowerCase() })
    
    if (!user) {
      console.log('❌ User not found!')
      return
    }

    console.log('👤 User Info:')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   User ID: ${user._id}`)
    console.log(`   Stats in DB:`, user.stats)
    console.log('')

    // Check actual posts
    console.log('📝 Checking actual posts in database...')
    
    const allPosts = await Post.find({ author: user._id })
    const publishedPosts = await Post.find({ author: user._id, status: 'published' })
    const draftPosts = await Post.find({ author: user._id, status: 'draft' })
    
    console.log(`   Total posts (all statuses): ${allPosts.length}`)
    console.log(`   Published posts: ${publishedPosts.length}`)
    console.log(`   Draft posts: ${draftPosts.length}`)
    console.log('')

    // Calculate actual stats
    let totalViews = 0
    let totalLikes = 0

    publishedPosts.forEach(post => {
      totalViews += post.views || 0
      totalLikes += post.likes ? post.likes.length : 0
    })

    console.log('📈 Actual Stats (from published posts):')
    console.log(`   Total Views: ${totalViews}`)
    console.log(`   Total Likes: ${totalLikes}`)
    console.log('')

    // Compare with user stats
    console.log('⚠️  Comparison:')
    console.log(`   Posts: DB shows ${user.stats?.totalPosts || 0}, Actual published: ${publishedPosts.length}`)
    console.log(`   Views: DB shows ${user.stats?.totalViews || 0}, Actual: ${totalViews}`)
    console.log(`   Likes: DB shows ${user.stats?.totalLikes || 0}, Actual: ${totalLikes}`)
    console.log('')

    if (publishedPosts.length > 0) {
      console.log('📄 Sample posts:')
      publishedPosts.slice(0, 5).forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title}`)
        console.log(`      Slug: ${post.slug}`)
        console.log(`      Status: ${post.status}`)
        console.log(`      Views: ${post.views || 0}`)
        console.log(`      Likes: ${post.likes?.length || 0}`)
        console.log(`      Published: ${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Not set'}`)
        console.log('')
      })
    }

    // Check if stats need updating
    const needsUpdate = 
      user.stats?.totalPosts !== publishedPosts.length ||
      user.stats?.totalViews !== totalViews ||
      user.stats?.totalLikes !== totalLikes

    if (needsUpdate) {
      console.log('🔧 Stats need to be updated!')
      console.log('   Run: node scripts/sync-user-stats.js')
    } else {
      console.log('✅ Stats are correct!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

checkUserPosts()
