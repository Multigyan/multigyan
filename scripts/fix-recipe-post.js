#!/usr/bin/env node

/**
 * ========================================
 * RECIPE POST FIX SCRIPT
 * ========================================
 * Fixes contentType and adds recipe-specific data
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Import models
const Post = require('../models/Post').default
const User = require('../models/User').default
const Category = require('../models/Category').default

const RECIPE_SLUG = 'simple-moong-dal-khichdi-a-balanced-one-pot-meal'

async function fixRecipePost() {
  try {
    console.log('🔍 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    console.log(`📝 Finding post: "${RECIPE_SLUG}"`)
    console.log('=' .repeat(80))

    const post = await Post.findOne({ slug: RECIPE_SLUG })

    if (!post) {
      console.log('❌ Post not found!')
      return
    }

    console.log('✅ Post found!')
    console.log(`   Current contentType: ${post.contentType}`)
    console.log(`   Current status: ${post.status}\n`)

    // ============================================
    // STEP 1: Fix contentType
    // ============================================
    console.log('🔧 STEP 1: Fixing contentType...')
    if (post.contentType !== 'recipe') {
      post.contentType = 'recipe'
      console.log('   ✅ Updated contentType from "blog" to "recipe"')
    } else {
      console.log('   ℹ️  contentType is already "recipe"')
    }

    // ============================================
    // STEP 2: Add Recipe-Specific Fields
    // ============================================
    console.log('\n🔧 STEP 2: Adding recipe-specific fields...')
    
    // Extract ingredients from content
    const ingredients = [
      '1/2 cup Moong Dal (split yellow lentils)',
      '1/2 cup Basmati Rice',
      '1 tbsp Ghee (or oil for vegan)',
      '1 tsp Cumin Seeds (Jeera)',
      '1/4 tsp Asafoetida (Hing)',
      '1/2 inch Ginger, finely chopped',
      '1/2 tsp Turmeric Powder (Haldi)',
      '3 cups Water',
      'Salt to taste',
      'Fresh Coriander (Dhania) for garnish'
    ]

    post.recipeIngredients = ingredients
    console.log(`   ✅ Added ${ingredients.length} ingredients`)

    // Add cooking times
    post.recipePrepTime = '10 minutes'
    post.recipeCookTime = '15 minutes'
    post.recipeServings = '4 servings'
    console.log('   ✅ Added prep time: 10 minutes')
    console.log('   ✅ Added cook time: 15 minutes')
    console.log('   ✅ Added servings: 4 servings')

    // Add cuisine and diet
    post.recipeCuisine = 'Indian'
    post.recipeDiet = ['Vegetarian', 'Gluten-Free']
    console.log('   ✅ Added cuisine: Indian')
    console.log('   ✅ Added diet: Vegetarian, Gluten-Free')

    // Also update legacy fields for backward compatibility
    post.prepTime = 10
    post.cookTime = 15
    post.servings = 4
    post.servingUnit = 'servings'
    post.diet = ['Vegetarian', 'Gluten-Free']
    console.log('   ✅ Updated legacy fields for compatibility')

    // ============================================
    // STEP 3: Save Changes
    // ============================================
    console.log('\n💾 STEP 3: Saving changes...')
    await post.save()
    console.log('   ✅ Changes saved successfully!')

    // ============================================
    // STEP 4: Verify Changes
    // ============================================
    console.log('\n🔍 STEP 4: Verifying changes...')
    const updatedPost = await Post.findOne({ slug: RECIPE_SLUG })
      .populate('author', 'name username')
      .populate('category', 'name')
      .lean()

    console.log('\n📊 UPDATED POST DATA:')
    console.log('=' .repeat(80))
    console.log(`   Title: ${updatedPost.title}`)
    console.log(`   Content Type: ${updatedPost.contentType}`)
    console.log(`   Status: ${updatedPost.status}`)
    console.log(`   Prep Time: ${updatedPost.recipePrepTime}`)
    console.log(`   Cook Time: ${updatedPost.recipeCookTime}`)
    console.log(`   Servings: ${updatedPost.recipeServings}`)
    console.log(`   Cuisine: ${updatedPost.recipeCuisine}`)
    console.log(`   Diet: ${updatedPost.recipeDiet?.join(', ')}`)
    console.log(`   Ingredients: ${updatedPost.recipeIngredients?.length} items`)

    // ============================================
    // STEP 5: Test Recipe Page Query
    // ============================================
    console.log('\n🔍 STEP 5: Testing recipe page query...')
    const recipePagePosts = await Post.find({ 
      status: 'published', 
      contentType: 'recipe' 
    })
    .select('_id title slug contentType')
    .lean()

    console.log(`   ✅ Found ${recipePagePosts.length} published recipes`)
    if (recipePagePosts.length > 0) {
      console.log('   Recipes:')
      recipePagePosts.forEach((recipe, index) => {
        console.log(`      ${index + 1}. ${recipe.title}`)
      })
    }

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('\n' + '=' .repeat(80))
    console.log('✅ SUCCESS! Recipe post has been fixed!')
    console.log('=' .repeat(80))
    console.log('\n🎉 Next Steps:')
    console.log('   1. Visit https://www.multigyan.in/recipe to see your recipe')
    console.log('   2. Visit the recipe page directly:')
    console.log(`      https://www.multigyan.in/blog/${RECIPE_SLUG}`)
    console.log('   3. Clear your browser cache if needed')
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
fixRecipePost()
