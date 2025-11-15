// scripts/verify-optimization-setup.js
// Verify that all optimization files and dependencies are ready
// Usage: node scripts/verify-optimization-setup.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = path.join(__dirname, '..')

console.log('🔍 VERIFYING OPTIMIZATION SETUP')
console.log('================================\n')

let allGood = true

// ========================================
// CHECK 1: Required Files Exist
// ========================================
console.log('📁 Checking Required Files...\n')

const requiredFiles = [
  'scripts/add-database-indexes.js',
  'scripts/test-performance.js',
  'lib/redis-cache.js',
  'lib/performance-monitor.js',
  'app/api/posts/route-optimized.js',
  'OPTIMIZATION_CHECKLIST.md'
]

requiredFiles.forEach(file => {
  const filePath = path.join(rootDir, file)
  const exists = fs.existsSync(filePath)
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allGood = false
})

// ========================================
// CHECK 2: Package Dependencies
// ========================================
console.log('\n📦 Checking Package Dependencies...\n')

const packageJsonPath = path.join(rootDir, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

const requiredDeps = [
  '@upstash/redis',
  '@vercel/analytics',
  'mongoose'
]

requiredDeps.forEach(dep => {
  const installed = packageJson.dependencies[dep] !== undefined
  console.log(`  ${installed ? '✅' : '❌'} ${dep} ${installed ? `(${packageJson.dependencies[dep]})` : '(MISSING!)'}`)
  if (!installed) allGood = false
})

// ========================================
// CHECK 3: NPM Scripts
// ========================================
console.log('\n🔧 Checking NPM Scripts...\n')

const requiredScripts = [
  'optimize:indexes',
  'optimize:all',
  'test:performance'
]

requiredScripts.forEach(script => {
  const exists = packageJson.scripts[script] !== undefined
  console.log(`  ${exists ? '✅' : '❌'} npm run ${script}`)
  if (!exists) allGood = false
})

// ========================================
// CHECK 4: Environment Variables
// ========================================
console.log('\n🔑 Checking Environment Variables...\n')

const envPath = path.join(rootDir, '.env.local')
const envExists = fs.existsSync(envPath)

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]
  
  const optionalEnvVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ]
  
  requiredEnvVars.forEach(envVar => {
    const exists = envContent.includes(envVar)
    console.log(`  ${exists ? '✅' : '❌'} ${envVar} ${exists ? '(SET)' : '(REQUIRED!)'}`)
    if (!exists) allGood = false
  })
  
  console.log('\n  Optional (for Redis caching):')
  optionalEnvVars.forEach(envVar => {
    const exists = envContent.includes(envVar)
    console.log(`  ${exists ? '✅' : '⭐'} ${envVar} ${exists ? '(SET)' : '(Optional)'}`)
  })
} else {
  console.log('  ❌ .env.local file not found!')
  allGood = false
}

// ========================================
// CHECK 5: Database Connection
// ========================================
console.log('\n🔌 Checking MongoDB Connection String...\n')

if (process.env.MONGODB_URI) {
  console.log('  ✅ MONGODB_URI is set')
  
  // Basic validation
  const uri = process.env.MONGODB_URI
  if (uri.includes('mongodb+srv://') || uri.includes('mongodb://')) {
    console.log('  ✅ Valid MongoDB connection string format')
  } else {
    console.log('  ⚠️  Connection string might be invalid')
  }
} else {
  console.log('  ❌ MONGODB_URI not found in environment')
  console.log('  💡 Make sure to run: export $(cat .env.local | xargs)')
}

// ========================================
// SUMMARY
// ========================================
console.log('\n' + '='.repeat(50))
console.log('\n📊 VERIFICATION SUMMARY\n')

if (allGood) {
  console.log('✅ All checks passed!')
  console.log('\n🚀 You\'re ready to optimize!')
  console.log('\nNext Steps:')
  console.log('  1. npm run optimize:indexes')
  console.log('  2. npm run test:performance')
  console.log('  3. git commit and deploy')
  console.log('\n💡 See OPTIMIZATION_CHECKLIST.md for details')
} else {
  console.log('❌ Some checks failed!')
  console.log('\n⚠️  Please fix the issues above before continuing.')
  console.log('\nCommon Fixes:')
  console.log('  - Install deps: npm install')
  console.log('  - Check .env.local exists and has all required variables')
  console.log('  - Make sure you\'re in the correct directory')
  process.exit(1)
}

console.log('\n' + '='.repeat(50) + '\n')
