#!/usr/bin/env node

// Simple verification script
console.log('\n🔍 CHECKING OPTIMIZATION SETUP...\n')

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

let allGood = true

// Check 1: Required files
console.log('📁 Required Files:')
const files = [
  'lib/redis-cache.js',
  'lib/performance-monitor.js',
  'scripts/add-database-indexes.js',
  'scripts/test-performance.js',
  'docs/OPTIMIZATION_GUIDE.md',
  'docs/QUICK_REDIS_SETUP.md'
]

files.forEach(file => {
  const exists = fs.existsSync(path.join(rootDir, file))
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allGood = false
})

// Check 2: Dependencies
console.log('\n📦 Dependencies:')
const pkgPath = path.join(rootDir, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

const deps = ['@upstash/redis', '@vercel/analytics', 'mongoose']
deps.forEach(dep => {
  const installed = pkg.dependencies[dep] !== undefined
  console.log(`  ${installed ? '✅' : '❌'} ${dep}`)
  if (!installed) allGood = false
})

// Check 3: Scripts
console.log('\n🔧 NPM Scripts:')
const scripts = ['optimize:indexes', 'test:performance']
scripts.forEach(script => {
  const exists = pkg.scripts[script] !== undefined
  console.log(`  ${exists ? '✅' : '❌'} ${script}`)
  if (!exists) allGood = false
})

// Check 4: Environment
console.log('\n🔑 Environment Variables:')
const hasEnv = fs.existsSync(path.join(rootDir, '.env.local'))
console.log(`  ${hasEnv ? '✅' : '❌'} .env.local exists`)
if (!hasEnv) allGood = false

console.log('\n' + '='.repeat(50))
if (allGood) {
  console.log('\n✅ ALL CHECKS PASSED!\n')
  console.log('📋 NEXT STEPS:')
  console.log('  1. Run: npm run optimize:indexes')
  console.log('  2. Run: npm run test:performance')
  console.log('  3. Replace your route files')
  console.log('  4. Commit and deploy')
  console.log('\n💡 See OPTIMIZATION_CHECKLIST.md for details\n')
} else {
  console.log('\n❌ SOME CHECKS FAILED\n')
  console.log('Please fix the issues above before continuing.\n')
  process.exit(1)
}

console.log('='.repeat(50) + '\n')
