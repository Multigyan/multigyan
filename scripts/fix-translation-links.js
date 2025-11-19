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

async function fixTranslationLinks() {
  try {
    console.log('\n🔧 FIXING TRANSLATION LINKS...\n')

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

    const englishPost = pmayPosts.find(p => p.lang === 'en')
    const hindiPost = pmayPosts.find(p => p.lang === 'hi')

    if (!englishPost || !hindiPost) {
      console.log('❌ Missing English or Hindi post!')
      console.log('   Found posts:')
      pmayPosts.forEach(p => {
        console.log(`   - ${p.lang}: ${p.title}`)
      })
      return
    }

    console.log('📝 Found both posts:')
    console.log(`   🇬🇧 English: ${englishPost.title}`)
    console.log(`   🇮🇳 Hindi: ${hindiPost.title}\n`)

    // Check current state
    const alreadyLinked = hindiPost.translationOf?.toString() === englishPost._id.toString()

    if (alreadyLinked) {
      console.log('✅ Posts are already correctly linked!')
      console.log('   Hindi post → English post: ✓\n')
      console.log('💡 If language switcher still doesn\'t work:')
      console.log('   1. Clear browser cache (Ctrl + Shift + R)')
      console.log('   2. Restart your dev server')
      console.log('   3. Check LanguageSwitcher component is imported\n')
      return
    }

    // Fix the link
    console.log('🔧 Updating Hindi post to link to English post...')
    
    hindiPost.translationOf = englishPost._id
    await hindiPost.save()

    console.log('✅ Successfully linked posts!\n')
    
    console.log('📍 VERIFICATION:')
    console.log(`   English page: /blog/${englishPost.slug}`)
    console.log(`   └─ Shows: 🇮🇳 हिंदी में पढ़ें`)
    console.log(`   └─ Links to: /blog/${hindiPost.slug}\n`)
    
    console.log(`   Hindi page: /blog/${hindiPost.slug}`)
    console.log(`   └─ Shows: 🇬🇧 Read in English`)
    console.log(`   └─ Links to: /blog/${englishPost.slug}\n`)

    console.log('🎉 Language switcher should now work in BOTH directions!\n')
    console.log('💡 Test it:')
    console.log(`   1. Visit: http://localhost:3000/blog/${hindiPost.slug}`)
    console.log(`   2. Click "Read in English" button`)
    console.log(`   3. Should navigate to: /blog/${englishPost.slug}\n`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  }
}

// Run the fix
(async () => {
  await connectDB()
  await fixTranslationLinks()
})()
