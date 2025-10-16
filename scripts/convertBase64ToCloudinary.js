/**
 * Script to convert base64 images in blog posts to Cloudinary URLs
 * 
 * Run this script to clean up any existing base64 images in your posts
 * Usage: node scripts/convertBase64ToCloudinary.js
 */

import mongoose from 'mongoose'
import Post from '../models/Post.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// Upload base64 image to Cloudinary
async function uploadBase64ToCloudinary(base64Data) {
  try {
    const formData = new FormData()
    formData.append('file', base64Data)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'multigyan/posts/content')
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    return null
  }
}

// Extract and convert base64 images from HTML content
async function convertBase64Images(htmlContent) {
  if (!htmlContent) return htmlContent
  
  // Regex to match base64 images in img src attributes
  const base64Regex = /<img[^>]+src="data:image\/[^;]+;base64,([^"]+)"[^>]*>/g
  
  let convertedContent = htmlContent
  let match
  let conversions = 0
  
  while ((match = base64Regex.exec(htmlContent)) !== null) {
    const fullMatch = match[0]
    const base64Data = match[0].match(/src="([^"]+)"/)[1]
    
    console.log(`  Found base64 image (${base64Data.substring(0, 50)}...)`)
    
    // Upload to Cloudinary
    const cloudinaryUrl = await uploadBase64ToCloudinary(base64Data)
    
    if (cloudinaryUrl) {
      // Replace base64 with Cloudinary URL
      const newImgTag = fullMatch.replace(/src="[^"]+"/, `src="${cloudinaryUrl}"`)
      convertedContent = convertedContent.replace(fullMatch, newImgTag)
      conversions++
      console.log(`  ✅ Converted to: ${cloudinaryUrl}`)
    } else {
      console.log(`  ❌ Failed to convert image`)
    }
  }
  
  return { content: convertedContent, conversions }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting base64 to Cloudinary conversion...\n')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')
    
    // Find all posts
    const posts = await Post.find({})
    console.log(`📝 Found ${posts.length} posts to check\n`)
    
    let totalConversions = 0
    let postsUpdated = 0
    
    // Process each post
    for (const post of posts) {
      console.log(`\n📄 Checking post: "${post.title}" (${post._id})`)
      
      // Check if content has base64 images
      if (post.content && post.content.includes('data:image')) {
        console.log('  Found base64 images in content')
        
        const { content, conversions } = await convertBase64Images(post.content)
        
        if (conversions > 0) {
          // Update post
          post.content = content
          await post.save()
          
          totalConversions += conversions
          postsUpdated++
          
          console.log(`  ✅ Updated post with ${conversions} converted image(s)`)
        }
      } else {
        console.log('  ✓ No base64 images found')
      }
    }
    
    console.log('\n\n🎉 Conversion complete!')
    console.log(`📊 Results:`)
    console.log(`   - Posts checked: ${posts.length}`)
    console.log(`   - Posts updated: ${postsUpdated}`)
    console.log(`   - Images converted: ${totalConversions}`)
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
    process.exit(0)
  }
}

main()
