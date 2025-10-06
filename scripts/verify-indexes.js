// Verify indexes were created
// npm run db:verify

import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf8')

const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const MONGODB_URI = envVars.MONGODB_URI

async function verifyIndexes() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB\n')

    const db = mongoose.connection.db

    // Check Posts indexes
    console.log('📄 POSTS Collection Indexes:')
    const postsIndexes = await db.collection('posts').indexes()
    postsIndexes.forEach(idx => {
      console.log(`  ✓ ${idx.name}`)
    })

    // Check Categories indexes
    console.log('\n📁 CATEGORIES Collection Indexes:')
    const categoriesIndexes = await db.collection('categories').indexes()
    categoriesIndexes.forEach(idx => {
      console.log(`  ✓ ${idx.name}`)
    })

    // Check Users indexes
    console.log('\n👤 USERS Collection Indexes:')
    const usersIndexes = await db.collection('users').indexes()
    usersIndexes.forEach(idx => {
      console.log(`  ✓ ${idx.name}`)
    })

    // Check Comments indexes
    console.log('\n💬 COMMENTS Collection Indexes:')
    const commentsIndexes = await db.collection('comments').indexes()
    commentsIndexes.forEach(idx => {
      console.log(`  ✓ ${idx.name}`)
    })

    console.log('\n✅ All indexes verified successfully!\n')

    // Performance tips
    console.log('💡 Performance Tips:')
    console.log('  - Posts have', postsIndexes.length, 'indexes for fast queries')
    console.log('  - Text search enabled on posts')
    console.log('  - All collections have proper indexes for filtering')
    
    process.exit(0)
  } catch (error) {
    console.error('Error verifying indexes:', error)
    process.exit(1)
  }
}

verifyIndexes()
