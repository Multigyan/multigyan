#!/usr/bin/env node

/**
 * ========================================
 * RECIPE POST DIAGNOSTIC SCRIPT
 * ========================================
 * Checks if recipe data is properly stored in database
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Import models
const Post = require('../models/Post').default
const User = require('../models/User').default
const Category = require('../models/Category').default

const RECIPE_SLUG = 'simple-moong-dal-khichdi-a-balanced-one-pot-meal'

async function checkRecipePost() {
  try {
    console.log('🔍 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    console.log(`📝 Searching for post with slug: "${RECIPE_SLUG}"`)
    console.log('=' .repeat(80))

    const post = await Post.findOne({ slug: RECIPE_SLUG })
      .populate('author', 'name email username')
      .populate('category', 'name slug')
      .lean()

    if (!post) {
      console.log('❌ Post not found!')
      return
    }

    console.log('\n✅ POST FOUND!')
    console.log('=' .repeat(80))
    
    // Basic Info
    console.log('\n📌 BASIC INFO:')
    console.log(`   Title: ${post.title}`)
    console.log(`   Slug: ${post.slug}`)
    console.log(`   Status: ${post.status}`)
    console.log(`   Content Type: ${post.contentType || '❌ NOT SET'}`)
    console.log(`   Author: ${post.author?.name || 'Unknown'}`)
    console.log(`   Category: ${post.category?.name || 'Unknown'}`)
    console.log(`   Published: ${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Not published'}`)

    // Recipe-Specific Fields (Phase 2 - String-based)
    console.log('\n🍳 RECIPE FIELDS (Phase 2 - Simple):')
    console.log(`   recipePrepTime: ${post.recipePrepTime || '❌ NOT SET'}`)
    console.log(`   recipeCookTime: ${post.recipeCookTime || '❌ NOT SET'}`)
    console.log(`   recipeServings: ${post.recipeServings || '❌ NOT SET'}`)
    console.log(`   recipeCuisine: ${post.recipeCuisine || '❌ NOT SET'}`)
    console.log(`   recipeDiet: ${post.recipeDiet?.length > 0 ? post.recipeDiet.join(', ') : '❌ NOT SET'}`)
    console.log(`   recipeIngredients: ${post.recipeIngredients?.length > 0 ? `${post.recipeIngredients.length} items` : '❌ NOT SET'}`)

    if (post.recipeIngredients && post.recipeIngredients.length > 0) {
      console.log('\n   📋 Ingredients List:')
      post.recipeIngredients.forEach((ingredient, index) => {
        console.log(`      ${index + 1}. ${ingredient}`)
      })
    }

    // Legacy Recipe Fields
    console.log('\n🍽️ LEGACY RECIPE FIELDS (Phase 1):')
    console.log(`   prepTime: ${post.prepTime || '❌ NOT SET'} minutes`)
    console.log(`   cookTime: ${post.cookTime || '❌ NOT SET'} minutes`)
    console.log(`   servings: ${post.servings || '❌ NOT SET'}`)
    console.log(`   servingUnit: ${post.servingUnit || '❌ NOT SET'}`)
    console.log(`   cuisine: ${post.cuisine || '❌ NOT SET'}`)
    console.log(`   diet: ${post.diet?.length > 0 ? post.diet.join(', ') : '❌ NOT SET'}`)
    console.log(`   ingredients (structured): ${post.ingredients?.length > 0 ? `${post.ingredients.length} items` : '❌ NOT SET'}`)

    // Affiliate Links
    console.log('\n🛒 AFFILIATE LINKS:')
    if (post.affiliateLinks && post.affiliateLinks.length > 0) {
      console.log(`   Count: ${post.affiliateLinks.length}`)
      post.affiliateLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.productName} (${link.platform})`)
      })
    } else {
      console.log('   ❌ NOT SET')
    }

    // Query Test
    console.log('\n🔎 QUERY TEST:')
    console.log('   Testing different query combinations...')
    
    const queries = [
      { status: 'published', contentType: 'recipe' },
      { status: 'published', slug: RECIPE_SLUG },
      { slug: RECIPE_SLUG },
    ]

    for (const query of queries) {
      const result = await Post.findOne(query).select('_id title contentType status')
      console.log(`   Query: ${JSON.stringify(query)}`)
      console.log(`   Result: ${result ? '✅ FOUND' : '❌ NOT FOUND'}`)
      if (result) {
        console.log(`      - contentType: ${result.contentType}`)
        console.log(`      - status: ${result.status}`)
      }
      console.log('')
    }

    // Count all recipes
    const recipeCount = await Post.countDocuments({ 
      status: 'published', 
      contentType: 'recipe' 
    })
    console.log(`\n📊 Total published recipes in database: ${recipeCount}`)

    // Recommendation
    console.log('\n💡 RECOMMENDATIONS:')
    console.log('=' .repeat(80))
    
    if (post.contentType !== 'recipe') {
      console.log('❌ ISSUE: contentType is not set to "recipe"')
      console.log('   FIX: Update the post contentType to "recipe" in the database')
    }
    
    if (post.status !== 'published') {
      console.log('❌ ISSUE: Post status is not "published"')
      console.log('   FIX: Publish the post from the dashboard')
    }

    if (!post.recipePrepTime && !post.recipeCookTime && !post.recipeServings) {
      console.log('❌ ISSUE: Recipe fields are empty')
      console.log('   FIX: The recipe fields were not saved when creating the post')
      console.log('   ACTION: Edit the post and fill in the recipe fields again')
    }

    if (!post.recipeIngredients || post.recipeIngredients.length === 0) {
      console.log('❌ ISSUE: No ingredients found')
      console.log('   FIX: Add ingredients to the recipe post')
    }

    console.log('\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await mongoose.connection.close()
    console.log('👋 Connection closed')
  }
}

// Run the check
checkRecipePost()
