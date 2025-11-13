#!/usr/bin/env node

/**
 * ========================================
 * FIX ALL RECIPES - UNIVERSAL SCRIPT
 * ========================================
 * Automatically finds all posts in "Recipes" category
 * and sets their contentType to 'recipe'
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Import models
const Post = require('../models/Post').default
const Category = require('../models/Category').default

async function fixAllRecipes() {
  try {
    console.log('🔍 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // ============================================
    // STEP 1: Find Recipes Category
    // ============================================
    console.log('📂 STEP 1: Finding Recipes category...')
    const recipesCategory = await Category.findOne({ 
      $or: [
        { name: { $regex: /^recipe/i } },  // Matches "Recipes", "Recipe", etc.
        { slug: { $regex: /recipe/i } }     // Matches slug containing "recipe"
      ]
    })

    if (!recipesCategory) {
      console.log('❌ Recipes category not found!')
      console.log('   Please create a category named "Recipes" first.')
      return
    }

    console.log(`✅ Found category: "${recipesCategory.name}"`)
    console.log(`   Category ID: ${recipesCategory._id}`)
    console.log(`   Slug: ${recipesCategory.slug}\n`)

    // ============================================
    // STEP 2: Find All Posts in Recipes Category
    // ============================================
    console.log('📝 STEP 2: Finding all posts in Recipes category...')
    const recipePosts = await Post.find({ category: recipesCategory._id })
      .select('_id title slug contentType status')
      .lean()

    console.log(`✅ Found ${recipePosts.length} posts in Recipes category\n`)

    if (recipePosts.length === 0) {
      console.log('ℹ️  No posts found in Recipes category.')
      console.log('   Create recipe posts and assign them to the Recipes category first.')
      return
    }

    // Display current status
    console.log('📊 CURRENT STATUS:')
    console.log('=' .repeat(80))
    recipePosts.forEach((post, index) => {
      const statusIcon = post.contentType === 'recipe' ? '✅' : '❌'
      const publishedIcon = post.status === 'published' ? '✅' : '⚠️ '
      console.log(`${index + 1}. ${statusIcon} ${post.title}`)
      console.log(`   - contentType: ${post.contentType || 'NOT SET'}`)
      console.log(`   - status: ${publishedIcon} ${post.status}`)
      console.log(`   - slug: ${post.slug}\n`)
    })

    // ============================================
    // STEP 3: Fix contentType for All Recipes
    // ============================================
    console.log('🔧 STEP 3: Fixing contentType for all recipe posts...')
    console.log('=' .repeat(80))

    let fixedCount = 0
    let alreadyCorrect = 0

    for (const recipePost of recipePosts) {
      const post = await Post.findById(recipePost._id)
      
      if (!post) {
        console.log(`⚠️  Skipped: Post not found (ID: ${recipePost._id})`)
        continue
      }

      if (post.contentType === 'recipe') {
        console.log(`✓ "${post.title}" - Already correct`)
        alreadyCorrect++
      } else {
        const oldType = post.contentType || 'blog'
        post.contentType = 'recipe'
        await post.save({ validateBeforeSave: false })
        console.log(`✅ "${post.title}" - Updated from "${oldType}" to "recipe"`)
        fixedCount++
      }
    }

    // ============================================
    // STEP 4: Verify Changes
    // ============================================
    console.log('\n🔍 STEP 4: Verifying changes...')
    console.log('=' .repeat(80))

    const verifyRecipes = await Post.find({ 
      category: recipesCategory._id 
    })
    .select('_id title contentType status')
    .lean()

    console.log('\n📊 UPDATED STATUS:')
    verifyRecipes.forEach((post, index) => {
      const icon = post.contentType === 'recipe' ? '✅' : '❌'
      console.log(`${index + 1}. ${icon} ${post.title} (${post.contentType})`)
    })

    // Count recipes by status
    const publishedRecipes = verifyRecipes.filter(p => p.status === 'published' && p.contentType === 'recipe')
    const draftRecipes = verifyRecipes.filter(p => p.status !== 'published')

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('\n' + '=' .repeat(80))
    console.log('🎉 TASK COMPLETED!')
    console.log('=' .repeat(80))
    console.log(`\n📊 Summary:`)
    console.log(`   Total posts processed: ${recipePosts.length}`)
    console.log(`   Fixed: ${fixedCount}`)
    console.log(`   Already correct: ${alreadyCorrect}`)
    console.log(`   Published recipes: ${publishedRecipes.length}`)
    console.log(`   Draft recipes: ${draftRecipes.length}`)

    if (publishedRecipes.length > 0) {
      console.log('\n✅ Published Recipes:')
      publishedRecipes.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.title}`)
        console.log(`      URL: https://multigyan.in/recipe/${recipe.slug}`)
      })
    }

    if (draftRecipes.length > 0) {
      console.log('\n⚠️  Recipes Not Published Yet:')
      draftRecipes.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.title} (${recipe.status})`)
      })
      console.log('\n   💡 Publish these posts from your admin dashboard to make them visible.')
    }

    console.log('\n🎉 Next Steps:')
    console.log('   1. Clear your Next.js cache: rm -rf .next')
    console.log('   2. Restart your dev server: npm run dev')
    console.log('   3. Clear browser cache (Ctrl+Shift+R)')
    console.log('   4. Visit https://multigyan.in to test')
    console.log('   5. Click on recipe cards - they should go to /recipe/slug')
    console.log('\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
  } finally {
    await mongoose.connection.close()
    console.log('👋 Connection closed\n')
  }
}

// Run the fix
fixAllRecipes()
