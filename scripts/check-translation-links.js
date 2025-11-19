import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Define Post Schema (minimal)
const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  lang: String,
  translationOf: mongoose.Schema.Types.ObjectId
}, { collection: 'posts' })

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

async function checkTranslationLinks() {
  try {
    console.log('\n🔍 CHECKING TRANSLATION LINKS...\n')

    // Find PMAY posts
    const pmayPosts = await Post.find({
      $or: [
        { slug: { $regex: /pmay.*2025/i } },
        { title: { $regex: /pmay.*2025/i } }
      ]
    }).sort({ lang: 1 })

    if (pmayPosts.length === 0) {
      console.log('❌ No PMAY posts found!')
      return
    }

    console.log(`📝 Found ${pmayPosts.length} PMAY post(s):\n`)

    const englishPost = pmayPosts.find(p => p.lang === 'en')
    const hindiPost = pmayPosts.find(p => p.lang === 'hi')

    // Display current state
    if (englishPost) {
      console.log('🇬🇧 ENGLISH POST:')
      console.log(`   ID: ${englishPost._id}`)
      console.log(`   Title: ${englishPost.title}`)
      console.log(`   Slug: ${englishPost.slug}`)
      console.log(`   Language: ${englishPost.lang}`)
      console.log(`   TranslationOf: ${englishPost.translationOf || 'null (this is original)'}\n`)
    }

    if (hindiPost) {
      console.log('🇮🇳 HINDI POST:')
      console.log(`   ID: ${hindiPost._id}`)
      console.log(`   Title: ${hindiPost.title}`)
      console.log(`   Slug: ${hindiPost.slug}`)
      console.log(`   Language: ${hindiPost.lang}`)
      console.log(`   TranslationOf: ${hindiPost.translationOf || '❌ NOT SET (PROBLEM!)'}\n`)
    }

    // Check if properly linked
    console.log('🔗 LINK STATUS:')
    
    if (englishPost && hindiPost) {
      const hindiLinksToEnglish = hindiPost.translationOf?.toString() === englishPost._id.toString()
      
      if (hindiLinksToEnglish) {
        console.log('✅ Hindi post correctly links to English post')
        console.log('✅ Language switcher should work in both directions!\n')
      } else {
        console.log('❌ Hindi post does NOT link to English post')
        console.log('❌ This is why the switcher doesn\'t work!\n')
        console.log('💡 Run the FIX script to correct this automatically.\n')
      }
    } else {
      console.log('⚠️  Missing one or both posts (English/Hindi)\n')
    }

    // Show expected URLs
    if (englishPost && hindiPost) {
      console.log('📍 EXPECTED BEHAVIOR:')
      console.log(`   English page: /blog/${englishPost.slug}`)
      console.log(`   └─ Should show button: 🇮🇳 हिंदी में पढ़ें`)
      console.log(`   └─ Links to: /blog/${hindiPost.slug}\n`)
      
      console.log(`   Hindi page: /blog/${hindiPost.slug}`)
      console.log(`   └─ Should show button: 🇬🇧 Read in English`)
      console.log(`   └─ Links to: /blog/${englishPost.slug}\n`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  }
}

// Run the diagnostic
(async () => {
  await connectDB()
  await checkTranslationLinks()
})()
