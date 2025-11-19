import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from root directory
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// Verify MongoDB URI is loaded
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not found in .env file')
  console.log('📝 Please check your .env file has:')
  console.log('   MONGODB_URI=mongodb+srv://...')
  process.exit(1)
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    console.log('📊 Database:', mongoose.connection.name)
    console.log('')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

// Define Post Schema (minimal - read-only)
const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  lang: String,
  status: String,
  translationOf: mongoose.Schema.Types.ObjectId,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  publishedAt: Date
}, { collection: 'posts' })

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

async function checkHindiBlogs() {
  try {
    console.log('🔍 Analyzing Hindi blogs in database...\n')
    console.log('='.repeat(80))
    console.log('')

    // Count all Hindi posts
    const totalHindi = await Post.countDocuments({ lang: 'hi' })
    
    // Count by status
    const published = await Post.countDocuments({ lang: 'hi', status: 'published' })
    const draft = await Post.countDocuments({ lang: 'hi', status: 'draft' })
    const pending = await Post.countDocuments({ lang: 'hi', status: 'pending_review' })
    const rejected = await Post.countDocuments({ lang: 'hi', status: 'rejected' })

    // Count with/without translations
    const withTranslation = await Post.countDocuments({ 
      lang: 'hi', 
      translationOf: { $ne: null } 
    })
    const withoutTranslation = totalHindi - withTranslation

    console.log('📊 HINDI BLOG STATISTICS')
    console.log('-'.repeat(80))
    console.log('')
    console.log(`   Total Hindi Blogs:        ${totalHindi}`)
    console.log(`   ├─ Published:             ${published}`)
    console.log(`   ├─ Draft:                 ${draft}`)
    console.log(`   ├─ Pending Review:        ${pending}`)
    console.log(`   └─ Rejected:              ${rejected}`)
    console.log('')
    console.log(`   With English Translation: ${withTranslation}`)
    console.log(`   Without Translation:      ${withoutTranslation}`)
    console.log('')
    console.log('='.repeat(80))
    console.log('')

    if (totalHindi === 0) {
      console.log('ℹ️  No Hindi blogs found in database.')
      console.log('   Hindi blogs should have: lang = "hi"')
      console.log('')
      return
    }

    // Get all Hindi posts with details
    console.log('📝 DETAILED LIST OF HINDI BLOGS:')
    console.log('-'.repeat(80))
    console.log('')

    const hindiPosts = await Post.find({ lang: 'hi' })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .lean()

    hindiPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`)
      console.log(`   ├─ Slug:          ${post.slug}`)
      console.log(`   ├─ Status:        ${post.status}`)
      console.log(`   ├─ Author:        ${post.author?.name || 'Unknown'}`)
      console.log(`   ├─ Created:       ${post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}`)
      console.log(`   ├─ Translation:   ${post.translationOf ? 'Yes ✓' : 'No ✗'}`)
      console.log(`   └─ Current URL:   https://www.multigyan.in/blog/${post.slug}`)
      console.log('')
    })

    console.log('='.repeat(80))
    console.log('')

    // Analyze slugs
    console.log('🔍 SLUG ANALYSIS:')
    console.log('-'.repeat(80))
    console.log('')

    const shortSlugs = hindiPosts.filter(post => post.slug && post.slug.length < 20)
    const longSlugs = hindiPosts.filter(post => post.slug && post.slug.length >= 20)

    console.log(`   Short Slugs (< 20 chars): ${shortSlugs.length}`)
    if (shortSlugs.length > 0) {
      console.log('   These likely need transliteration:')
      shortSlugs.forEach(post => {
        console.log(`      • ${post.slug} (${post.slug.length} chars)`)
      })
    }
    console.log('')

    console.log(`   Long Slugs (≥ 20 chars):  ${longSlugs.length}`)
    if (longSlugs.length > 0) {
      console.log('   These are probably already transliterated:')
      longSlugs.forEach(post => {
        console.log(`      • ${post.slug} (${post.slug.length} chars)`)
      })
    }
    console.log('')

    console.log('='.repeat(80))
    console.log('')

    // Recommendations
    console.log('💡 RECOMMENDATIONS:')
    console.log('-'.repeat(80))
    console.log('')

    if (shortSlugs.length > 0) {
      console.log(`   ✅ Run UPDATE script to fix ${shortSlugs.length} blog(s) with short slugs`)
      console.log('      Command: node scripts/update-hindi-slugs.js')
      console.log('')
    }

    if (withoutTranslation > 0) {
      console.log(`   📝 ${withoutTranslation} Hindi blog(s) not linked to English version`)
      console.log('      Consider creating English versions or vice versa')
      console.log('')
    }

    if (draft > 0) {
      console.log(`   📄 ${draft} Hindi blog(s) in draft status`)
      console.log('      Review and publish when ready')
      console.log('')
    }

    console.log('='.repeat(80))
    console.log('')
    console.log('✅ Analysis complete!')
    console.log('')

  } catch (error) {
    console.error('❌ Error checking Hindi blogs:', error)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  }
}

// Run the script
(async () => {
  await connectDB()
  await checkHindiBlogs()
})()
