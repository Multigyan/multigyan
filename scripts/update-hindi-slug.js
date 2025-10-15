/**
 * MIGRATION SCRIPT: Update Hindi slug to English slug
 * 
 * This script updates the existing blog post with Hindi slug to use
 * an English transliterated slug for better URL compatibility.
 * 
 * HOW TO RUN:
 * 1. Make sure you're in the project directory: cd D:\VS_Code\multigyan
 * 2. Run: node scripts/update-hindi-slug.js
 */

import mongoose from 'mongoose'
import slugify from 'slugify'

// Database connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vipul:vipul229198112@multigyan.syong86.mongodb.net/?retryWrites=true&w=majority&appName=Multigyan"

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Define Post schema (simplified)
const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  status: String
}, { collection: 'posts' })

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

// Main migration function
async function updateHindiSlug() {
  try {
    await connectDB()
    
    // Find the post with Hindi slug
    const oldSlug = 'पोपुलर-प्रोग्रामिंग-भाषाओं-का-व्यावहारिक-उपयोग-एक-संपूर्ण-गाइड-2025'
    const post = await Post.findOne({ slug: oldSlug })
    
    if (!post) {
      console.log('❌ Post not found with slug:', oldSlug)
      process.exit(0)
    }
    
    console.log('📝 Found post:')
    console.log('   Title:', post.title)
    console.log('   Old Slug:', post.slug)
    
    // Generate new English slug
    const newSlug = 'popular-programming-languages-practical-guide-2025'
    
    console.log('   New Slug:', newSlug)
    
    // Check if new slug already exists
    const existingPost = await Post.findOne({ slug: newSlug })
    if (existingPost && existingPost._id.toString() !== post._id.toString()) {
      console.log('❌ Slug already exists:', newSlug)
      console.log('   Please choose a different slug')
      process.exit(1)
    }
    
    // Update the slug
    post.slug = newSlug
    await post.save()
    
    console.log('✅ Successfully updated slug!')
    console.log('🌐 New URL: https://multigyan.vercel.app/blog/' + newSlug)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating slug:', error)
    process.exit(1)
  }
}

// Run the migration
updateHindiSlug()
