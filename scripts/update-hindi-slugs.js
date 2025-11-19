import mongoose from 'mongoose'
import slugify from 'slugify'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from root directory
dotenv.config({ path: join(__dirname, '..', '.env') })

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

// Define Post Schema (minimal)
const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  lang: String,
  status: String,
  translationOf: mongoose.Schema.Types.ObjectId
}, { collection: 'posts', timestamps: true })

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

/**
 * Generate SEO-friendly slug with Hindi transliteration
 */
function generateSlug(title) {
  if (!title) return ''
  
  return slugify(title, {
    lower: true,        // Convert to lowercase
    strict: true,       // Remove special characters
    locale: 'en',       // Use English locale for transliteration
    trim: true,         // Trim leading/trailing replacement chars
    remove: /[*+~.()'"`!:@]/g  // Remove these characters
  })
}

/**
 * Find a unique slug by appending numbers if needed
 */
async function findUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const query = { slug }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }
    
    const existing = await Post.findOne(query)
    if (!existing) {
      return slug
    }
    
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

async function updateHindiSlugs() {
  try {
    console.log('🔄 Starting Hindi slug update...')
    console.log('='.repeat(80))
    console.log('')

    // Find all Hindi posts
    const hindiPosts = await Post.find({ lang: 'hi' })

    if (hindiPosts.length === 0) {
      console.log('ℹ️  No Hindi blogs found in database.')
      console.log('   Make sure your Hindi posts have: lang = "hi"')
      console.log('')
      return
    }

    console.log(`📝 Found ${hindiPosts.length} Hindi blog(s) to process`)
    console.log('')
    console.log('='.repeat(80))
    console.log('')

    let updatedCount = 0
    let skippedCount = 0
    const updates = []

    for (const post of hindiPosts) {
      const oldSlug = post.slug
      
      // Generate new slug using transliteration
      const baseSlug = generateSlug(post.title)
      
      // Check if slug needs updating
      if (oldSlug === baseSlug) {
        console.log(`⏭️  SKIPPED (already correct):`)
        console.log(`   Title: ${post.title}`)
        console.log(`   Slug:  ${oldSlug}`)
        console.log(`   Status: ${post.status}`)
        console.log('')
        skippedCount++
        continue
      }

      // Find unique slug if needed
      const newSlug = await findUniqueSlug(baseSlug, post._id)

      // Update the post
      post.slug = newSlug
      await post.save()

      updatedCount++
      
      const updateInfo = {
        title: post.title,
        oldSlug,
        newSlug,
        oldUrl: `https://www.multigyan.in/blog/${oldSlug}`,
        newUrl: `https://www.multigyan.in/blog/${newSlug}`,
        status: post.status
      }
      
      updates.push(updateInfo)

      console.log(`✅ UPDATED #${updatedCount}:`)
      console.log(`   Title:     ${post.title}`)
      console.log(`   Status:    ${post.status}`)
      console.log(`   Old Slug:  ${oldSlug} (${oldSlug.length} chars)`)
      console.log(`   New Slug:  ${newSlug} (${newSlug.length} chars)`)
      console.log(`   Old URL:   ${updateInfo.oldUrl}`)
      console.log(`   New URL:   ${updateInfo.newUrl}`)
      console.log('')
    }

    console.log('='.repeat(80))
    console.log('')
    console.log('📊 SUMMARY:')
    console.log('-'.repeat(80))
    console.log('')
    console.log(`   Total Hindi Blogs:  ${hindiPosts.length}`)
    console.log(`   ✅ Updated:         ${updatedCount}`)
    console.log(`   ⏭️  Skipped:         ${skippedCount}`)
    console.log('')

    if (updatedCount > 0) {
      console.log('='.repeat(80))
      console.log('')
      console.log('🎯 UPDATED URLS (for your reference):')
      console.log('-'.repeat(80))
      console.log('')
      
      updates.forEach((update, index) => {
        console.log(`${index + 1}. ${update.title}`)
        console.log(`   Status: ${update.status}`)
        console.log(`   New URL: ${update.newUrl}`)
        console.log('')
      })

      console.log('='.repeat(80))
      console.log('')
      console.log('⚠️  IMPORTANT NEXT STEPS:')
      console.log('-'.repeat(80))
      console.log('')
      console.log('   1. Test updated URLs on localhost')
      console.log('   2. If published posts were updated, consider:')
      console.log('      • Setting up 301 redirects from old URLs')
      console.log('      • Updating any external links')
      console.log('      • Notifying Google Search Console')
      console.log('   3. Deploy changes to production')
      console.log('   4. Run this script again on production database')
      console.log('')
    }

    console.log('='.repeat(80))
    console.log('')
    console.log('🎉 Hindi slug update completed!')
    console.log('')

  } catch (error) {
    console.error('❌ Error updating Hindi slugs:', error)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  }
}

// Run the script
(async () => {
  await connectDB()
  await updateHindiSlugs()
})()
