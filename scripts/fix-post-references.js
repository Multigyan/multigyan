// scripts/fix-post-references.js
// Fixes all author and category fields to be proper ObjectIds
// Run once to fix data consistency issues

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found')
  process.exit(1)
}

async function fixPostReferences() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    const postsCollection = db.collection('posts')

    // ========================================
    // STEP 1: Find posts with string author/category
    // ========================================
    console.log('📊 Analyzing post references...\n')

    const allPosts = await postsCollection.find({}).toArray()
    console.log(`Total posts in database: ${allPosts.length}`)

    let stringAuthors = 0
    let stringCategories = 0
    let nullAuthors = 0
    let nullCategories = 0

    allPosts.forEach(post => {
      if (!post.author) nullAuthors++
      else if (typeof post.author === 'string') stringAuthors++
      
      if (!post.category) nullCategories++
      else if (typeof post.category === 'string') stringCategories++
    })

    console.log(`\n📋 Current State:`)
    console.log(`  - Posts with string authors: ${stringAuthors}`)
    console.log(`  - Posts with null authors: ${nullAuthors}`)
    console.log(`  - Posts with string categories: ${stringCategories}`)
    console.log(`  - Posts with null categories: ${nullCategories}`)

    // ========================================
    // STEP 2: Fix author references
    // ========================================
    console.log('\n🔧 Fixing author references...\n')

    const postsWithStringAuthors = await postsCollection.find({
      author: { $type: 'string' }
    }).toArray()

    let authorFixed = 0
    for (const post of postsWithStringAuthors) {
      try {
        const authorObjectId = new mongoose.Types.ObjectId(post.author)
        await postsCollection.updateOne(
          { _id: post._id },
          { $set: { author: authorObjectId } }
        )
        authorFixed++
        if (authorFixed % 10 === 0) {
          process.stdout.write(`  Fixed ${authorFixed}/${postsWithStringAuthors.length} authors...\r`)
        }
      } catch (error) {
        console.error(`\n  ❌ Failed to fix author for post ${post._id}: ${error.message}`)
      }
    }

    console.log(`\n  ✅ Fixed ${authorFixed} author references`)

    // ========================================
    // STEP 3: Fix category references
    // ========================================
    console.log('\n🔧 Fixing category references...\n')

    const postsWithStringCategories = await postsCollection.find({
      category: { $type: 'string' }
    }).toArray()

    let categoryFixed = 0
    for (const post of postsWithStringCategories) {
      try {
        const categoryObjectId = new mongoose.Types.ObjectId(post.category)
        await postsCollection.updateOne(
          { _id: post._id },
          { $set: { category: categoryObjectId } }
        )
        categoryFixed++
        if (categoryFixed % 10 === 0) {
          process.stdout.write(`  Fixed ${categoryFixed}/${postsWithStringCategories.length} categories...\r`)
        }
      } catch (error) {
        console.error(`\n  ❌ Failed to fix category for post ${post._id}: ${error.message}`)
      }
    }

    console.log(`\n  ✅ Fixed ${categoryFixed} category references`)

    // ========================================
    // STEP 4: Verify the fixes
    // ========================================
    console.log('\n📊 Verifying fixes...\n')

    const remainingStringAuthors = await postsCollection.countDocuments({
      author: { $type: 'string' }
    })

    const remainingStringCategories = await postsCollection.countDocuments({
      category: { $type: 'string' }
    })

    console.log('✅ Verification Results:')
    console.log(`  - Remaining string authors: ${remainingStringAuthors}`)
    console.log(`  - Remaining string categories: ${remainingStringCategories}`)

    if (remainingStringAuthors === 0 && remainingStringCategories === 0) {
      console.log('\n🎉 SUCCESS! All references are now proper ObjectIds!')
    } else {
      console.log('\n⚠️  Some string references remain. Check the errors above.')
    }

    // ========================================
    // STEP 5: Show updated statistics
    // ========================================
    console.log('\n📈 Updated Statistics:\n')

    const publishedPosts = await postsCollection.countDocuments({ status: 'published' })
    console.log(`Published posts: ${publishedPosts}`)

    const authorStats = await postsCollection.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$author', count: { $sum: 1 } } }
    ]).toArray()

    console.log(`Unique authors with published posts: ${authorStats.length}`)

    const categoryStats = await postsCollection.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray()

    console.log(`Unique categories with published posts: ${categoryStats.length}`)

    console.log('\n✅ Data cleanup completed successfully!')
    console.log('\n💡 Next steps:')
    console.log('   1. Refresh your authors and categories pages')
    console.log('   2. Statistics should now be consistent')
    console.log('   3. No more random value changes!')

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
    process.exit(0)
  }
}

fixPostReferences()
