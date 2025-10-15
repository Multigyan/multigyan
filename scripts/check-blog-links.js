/**
 * CHECK BROKEN BLOG LINKS
 * 
 * This script checks all blog post URLs to ensure they're working
 * and reports any 404 errors.
 * 
 * HOW TO RUN:
 * npm run db:check-links
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vipul:vipul229198112@multigyan.syong86.mongodb.net/?retryWrites=true&w=majority&appName=Multigyan"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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

// Define Post schema
const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  status: String,
  publishedAt: Date
}, { collection: 'posts' })

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

// Check if URL is accessible
async function checkURL(url) {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'follow' 
    })
    return {
      url,
      status: response.status,
      ok: response.ok
    }
  } catch (error) {
    return {
      url,
      status: 'ERROR',
      ok: false,
      error: error.message
    }
  }
}

// Main function
async function checkAllBlogLinks() {
  try {
    await connectDB()
    
    console.log('\n🔍 Checking all published blog post links...\n')
    
    // Get all published posts
    const posts = await Post.find({ status: 'published' })
      .select('title slug')
      .lean()
    
    console.log(`📊 Found ${posts.length} published posts\n`)
    
    const results = []
    let workingLinks = 0
    let brokenLinks = 0
    
    // Check each post URL
    for (const post of posts) {
      const url = `${SITE_URL}/blog/${post.slug}`
      const result = await checkURL(url)
      results.push({ ...result, title: post.title })
      
      if (result.ok) {
        workingLinks++
        console.log(`✅ ${result.status} - ${post.title}`)
      } else {
        brokenLinks++
        console.log(`❌ ${result.status} - ${post.title}`)
        console.log(`   URL: ${url}`)
        if (result.error) {
          console.log(`   Error: ${result.error}`)
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Posts: ${posts.length}`)
    console.log(`✅ Working Links: ${workingLinks}`)
    console.log(`❌ Broken Links: ${brokenLinks}`)
    console.log('='.repeat(60) + '\n')
    
    // List broken links
    if (brokenLinks > 0) {
      console.log('\n🔴 BROKEN LINKS:\n')
      results
        .filter(r => !r.ok)
        .forEach(r => {
          console.log(`• ${r.title}`)
          console.log(`  ${r.url}`)
          console.log(`  Status: ${r.status}\n`)
        })
    }
    
    process.exit(brokenLinks > 0 ? 1 : 0)
  } catch (error) {
    console.error('❌ Error checking links:', error)
    process.exit(1)
  }
}

// Run the check
checkAllBlogLinks()
