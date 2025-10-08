// Run this ONCE to create database indexes
// npm run db:index

import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load .env.local manually since we're using ES modules
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf8')

const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim()
    envVars[key] = value
  }
})

const MONGODB_URI = envVars.MONGODB_URI

if (!MONGODB_URI || !MONGODB_URI.startsWith('mongodb')) {
  console.error('Error: MONGODB_URI not found in .env.local')
  process.exit(1)
}

async function createIndexes() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const db = mongoose.connection.db

    // Posts collection indexes
    console.log('Creating posts indexes...')
    
    // Drop old text index if it exists
    try {
      await db.collection('posts').dropIndex('title_text_content_text')
      console.log('  Dropped old text index')
    } catch (e) {
      // Index might not exist, that's ok
    }
    
    await db.collection('posts').createIndex({ slug: 1 }, { unique: true })
    await db.collection('posts').createIndex({ status: 1, publishedAt: -1 })
    await db.collection('posts').createIndex({ category: 1, status: 1 })
    await db.collection('posts').createIndex({ author: 1, status: 1 })
    await db.collection('posts').createIndex({ status: 1, createdAt: -1 })
    await db.collection('posts').createIndex({ title: 'text', content: 'text', excerpt: 'text' })
    console.log('✓ Posts indexes created')

    // Categories collection indexes
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true })
    await db.collection('categories').createIndex({ isActive: 1 })
    console.log('✓ Categories indexes created')

    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true })
    await db.collection('users').createIndex({ role: 1 })
    console.log('✓ Users indexes created')

    // Comments collection indexes
    await db.collection('comments').createIndex({ post: 1, status: 1, createdAt: -1 })
    await db.collection('comments').createIndex({ author: 1, createdAt: -1 })
    console.log('✓ Comments indexes created')

    // Notifications collection indexes
    console.log('Creating notifications indexes...')
    await db.collection('notifications').createIndex({ recipient: 1, createdAt: -1 })
    await db.collection('notifications').createIndex({ recipient: 1, isRead: 1, createdAt: -1 })
    await db.collection('notifications').createIndex({ type: 1 })
    console.log('✓ Notifications indexes created')

    console.log('\n✓ All indexes created successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error creating indexes:', error)
    process.exit(1)
  }
}

createIndexes()
