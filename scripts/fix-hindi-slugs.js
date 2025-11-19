import mongoose from 'mongoose'
import slugify from 'slugify'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import readline from 'readline'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found')
      process.exit(1)
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    process.exit(1)
  }
}

const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  lang: String,
  translationOf: mongoose.Schema.Types.ObjectId,
  status: String
}, { collection: 'posts' })

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

async function updateHindiSlugs(autoConfirm = false) {
  try {
    console.log('\n🔄 HINDI SLUG UPDATE TOOL\n')
    
    const hindiPosts = await Post.find({ lang: 'hi' })
    
    if (hindiPosts.length === 0) {
      console.log('No Hindi posts found\n')
      return
    }

    console.log(`Found ${hindiPosts.length} Hindi post(s)\n`)
    
    const postsToUpdate = []
    
    for (const post of hindiPosts) {
      const oldSlug = post.slug
      const newSlug = slugify(post.title, {
        lower: true,
        strict: true,
        locale: 'en',
        trim: true,
        remove: /[*+~.()'"`!:@]/g
      })

      if (oldSlug !== newSlug) {
        postsToUpdate.push({ post, oldSlug, newSlug })
      }
    }

    if (postsToUpdate.length === 0) {
      console.log('All slugs are already optimized!\n')
      return
    }

    console.log('POSTS TO UPDATE:')
    postsToUpdate.forEach((item, i) => {
      console.log(`\n${i + 1}. ${item.post.title}`)
      console.log(`   OLD: ${item.oldSlug}`)
      console.log(`   NEW: ${item.newSlug}`)
    })

    if (!autoConfirm) {
      const answer = await question('\nProceed? (yes/no): ')
      if (answer.toLowerCase() !== 'yes') {
        console.log('Cancelled\n')
        return
      }
    }

    console.log('\nUpdating...\n')

    for (const item of postsToUpdate) {
      const { post, oldSlug, newSlug } = item
      
      const existingPost = await Post.findOne({ 
        slug: newSlug, 
        _id: { $ne: post._id } 
      })
      
      let finalSlug = newSlug
      if (existingPost) {
        let counter = 1
        while (await Post.findOne({ slug: `${newSlug}-${counter}` })) {
          counter++
        }
        finalSlug = `${newSlug}-${counter}`
      }

      post.slug = finalSlug
      await post.save()

      console.log(`✅ ${post.title}`)
      console.log(`   ${oldSlug} → ${finalSlug}\n`)
    }

    console.log('✅ Update completed!\n')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    rl.close()
    await mongoose.disconnect()
  }
}

const args = process.argv.slice(2)
const autoConfirm = args.includes('--yes') || args.includes('-y')

;(async () => {
  await connectDB()
  await updateHindiSlugs(autoConfirm)
})()
