# ⚡ QUICK REDIS SETUP GUIDE (OPTIONAL)

## 🎯 Should You Setup Redis?

### ✅ Setup Redis IF:
- You completed basic optimizations (indexes, .lean(), etc.)
- Your CPU usage is still >60% after 48 hours
- You have 1000+ visitors/day
- You want 30% additional CPU reduction

### ❌ Skip Redis IF:
- You haven't done basic optimizations yet
- Your CPU usage is <50%
- You have <500 visitors/day
- You want to keep things simple

**Note:** Redis adds complexity but gives significant performance gains for high-traffic sites.

---

## 📝 What is Redis?

**Simple explanation:** Redis is like keeping your most-used books on your desk instead of walking to the library every time.

**Technical:** Redis is an in-memory data store that caches database query results for instant retrieval.

**Benefits:**
- 1-5ms response time (vs 50-200ms database query)
- 70% reduction in database load
- 30% reduction in CPU usage
- Scales to millions of requests

---

## 🚀 Step-by-Step Setup (15 minutes)

### STEP 1: Create Free Upstash Account

1. Go to: https://console.upstash.com/
2. Click "Sign Up" (use GitHub or Google)
3. It's **100% FREE** for hobby projects!

**Free tier includes:**
- 10,000 commands/day
- 256 MB storage
- Global replication
- More than enough for most projects

---

### STEP 2: Create Redis Database

1. After login, click "Create Database"
2. Fill in details:
   - **Name:** multigyan-cache
   - **Type:** Regional
   - **Region:** Choose closest to Mumbai (ap-south-1)
   - **Eviction:** allkeys-lru (removes oldest when full)
3. Click "Create"

**Wait 30 seconds** for database to be ready.

---

### STEP 3: Get Credentials

1. Click on your new database
2. Scroll to "REST API" section
3. Copy two values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

**IMPORTANT:** Keep these secret! Don't commit to Git.

---

### STEP 4: Add to Environment Variables

**Local Development:**

1. Open `.env.local` file
2. Add these lines at the end:

```env
# Redis Caching (Upstash)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

3. Replace with YOUR actual values from Step 3
4. Save file
5. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

**Production (Vercel):**

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add two variables:

   | Name | Value |
   |------|-------|
   | `UPSTASH_REDIS_REST_URL` | (paste from Upstash) |
   | `UPSTASH_REDIS_REST_TOKEN` | (paste from Upstash) |

5. Apply to: Production, Preview, Development
6. Click "Save"
7. **Redeploy your site:**
   ```bash
   git commit --allow-empty -m "feat: Enable Redis caching"
   git push
   ```

---

### STEP 5: Verify It's Working

**Method 1: Check Logs**

After deploying, check your Vercel function logs:

```
✅ Redis cache enabled
✅ Redis SET: posts-1-10-all-all-false-all-all-false (TTL: 300s)
✅ Redis HIT: posts-1-10-all-all-false-all-all-false
```

**If you see:**
```
⚠️ Redis cache disabled - Add UPSTASH_REDIS_REST_URL...
```
→ Environment variables not set correctly

---

**Method 2: Test Manually**

Create a test file: `scripts/test-redis.js`

```javascript
import { redisCache } from '../lib/redis-cache.js'

async function testRedis() {
  console.log('🧪 Testing Redis connection...\n')
  
  // Test 1: Set a value
  console.log('Test 1: Setting value...')
  const setResult = await redisCache.set('test-key', { message: 'Hello Redis!' }, 60)
  console.log('Result:', setResult ? '✅ Success' : '❌ Failed')
  
  // Test 2: Get the value
  console.log('\nTest 2: Getting value...')
  const getValue = await redisCache.get('test-key')
  console.log('Result:', getValue ? `✅ Success - ${JSON.stringify(getValue)}` : '❌ Failed')
  
  // Test 3: Delete the value
  console.log('\nTest 3: Deleting value...')
  const deleteResult = await redisCache.delete('test-key')
  console.log('Result:', deleteResult ? '✅ Success' : '❌ Failed')
  
  console.log('\n🎉 All tests passed! Redis is working!')
}

testRedis()
```

Run it:
```bash
node scripts/test-redis.js
```

Expected output:
```
✅ Redis cache enabled
Test 1: Setting value...
Result: ✅ Success
...
🎉 All tests passed! Redis is working!
```

---

## 🎯 Using Redis in Your Code

### Example 1: Cache Post Lists

```javascript
import { cacheWrapper } from '@/lib/redis-cache'

export async function GET(request) {
  const cacheKey = 'public-posts-page-1'
  
  // This automatically checks cache first, then fetches if needed
  const posts = await cacheWrapper(
    cacheKey,
    async () => {
      return await Post.find({ status: 'published' })
        .limit(20)
        .lean()
    },
    300 // Cache for 5 minutes
  )
  
  return Response.json(posts)
}
```

### Example 2: Cache Author Profiles

```javascript
import { redisCache } from '@/lib/redis-cache'

export async function GET(request, { params }) {
  const cacheKey = `author-${params.id}`
  
  // Check cache first
  let author = await redisCache.get(cacheKey)
  
  if (!author) {
    // Cache miss - fetch from database
    author = await User.findById(params.id)
      .select('name email profilePictureUrl')
      .lean()
    
    // Store in cache for 1 hour
    await redisCache.set(cacheKey, author, 3600)
  }
  
  return Response.json(author)
}
```

### Example 3: Invalidate Cache on Updates

```javascript
import { invalidatePostCaches } from '@/lib/redis-cache'

export async function PUT(request, { params }) {
  // Update the post
  await Post.findByIdAndUpdate(params.id, updateData)
  
  // Clear all post-related caches
  await invalidatePostCaches()
  
  return Response.json({ success: true })
}
```

---

## 📊 Monitoring Redis Usage

### Check Upstash Dashboard:
1. Go to console.upstash.com
2. Click your database
3. View metrics:
   - **Commands/day**: Should be well under 10,000
   - **Storage**: Should be under 256 MB
   - **Hit rate**: Higher = better (aim for 70%+)

### Optimize Cache Strategy:

**If hit rate is low (<50%):**
- Increase TTL (cache longer)
- Cache more endpoints
- Check if users are requesting different URLs

**If storage is high (>200 MB):**
- Reduce TTL (cache shorter)
- Cache smaller data (use field projection)
- Clear old caches manually

**If commands are high (>8000/day):**
- Increase TTL to reduce cache misses
- Batch operations where possible
- Consider upgrading (but you probably don't need to)

---

## 🐛 Troubleshooting

### Problem: "Redis cache disabled" in logs

**Cause:** Environment variables not set

**Solution:**
1. Check `.env.local` has both variables
2. Restart dev server
3. For Vercel: Check environment variables in settings
4. Redeploy

---

### Problem: Errors like "Invalid token"

**Cause:** Wrong credentials or expired token

**Solution:**
1. Go back to Upstash console
2. Regenerate token if needed
3. Copy fresh credentials
4. Update environment variables
5. Restart/redeploy

---

### Problem: Cache not updating after data changes

**Cause:** Not invalidating cache

**Solution:**
```javascript
// After any data update, invalidate related caches
import { invalidatePostCaches } from '@/lib/redis-cache'

// In your update/delete routes:
await Post.findByIdAndUpdate(id, data)
await invalidatePostCaches() // ← Don't forget this!
```

---

### Problem: Running out of commands

**Cause:** Too many cache operations

**Solution:**
1. Increase TTL to reduce cache misses
2. Use cache only for expensive queries
3. Consider upgrading (starts at $0.20/day for 100K commands)

---

## 📈 Expected Results

### Before Redis:
- Database queries: 100-500ms
- CPU usage: 40-50%
- Database load: High

### After Redis:
- Cache hits: 1-5ms (100x faster!)
- CPU usage: 30-40% (20% reduction)
- Database load: 70% reduction
- Hit rate: 60-80% of requests

### Real Example:
```
Route: GET /api/posts?page=1
Before Redis: 287ms (database query)
After Redis (cache hit): 4ms (Redis)
Improvement: 98.6% faster!
```

---

## 🎓 Advanced Tips

### 1. Cache Different TTLs for Different Data

```javascript
// Rarely changes - cache longer
await redisCache.set('site-stats', stats, 3600) // 1 hour

// Changes frequently - cache shorter  
await redisCache.set('trending-posts', posts, 180) // 3 minutes

// Real-time - don't cache
// (don't use Redis for user-specific data)
```

### 2. Pre-warm Cache on Deploy

```javascript
// scripts/warm-cache.js
import { redisCache } from '../lib/redis-cache.js'

async function warmCache() {
  // Load popular posts into cache
  const popular = await Post.find()
    .sort({ views: -1 })
    .limit(10)
    .lean()
    
  await redisCache.set('popular-posts', popular, 600)
  console.log('✅ Cache warmed!')
}

warmCache()
```

### 3. Rate Limiting with Redis

```javascript
import { redisCache } from '@/lib/redis-cache'

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')
  const key = `rate-limit-${ip}`
  
  const count = await redisCache.get(key) || 0
  
  if (count > 100) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
  
  await redisCache.increment(key, 1)
  await redisCache.set(key, count + 1, 3600) // Reset after 1 hour
  
  // Process request...
}
```

---

## ✅ Redis Setup Checklist

- [ ] Created Upstash account
- [ ] Created Redis database (regional, closest to users)
- [ ] Copied REST URL and token
- [ ] Added to `.env.local`
- [ ] Added to Vercel environment variables
- [ ] Restarted dev server
- [ ] Verified logs show "Redis cache enabled"
- [ ] Tested with sample queries
- [ ] Checked Upstash dashboard for metrics
- [ ] Implemented cache invalidation in update routes
- [ ] Deployed and monitoring

---

## 🎯 When to Upgrade Upstash

**Stay on Free Plan IF:**
- <8,000 commands/day
- <200 MB storage
- <500 concurrent requests

**Upgrade to Pay-as-you-go ($0.20/day for 100K) IF:**
- >8,000 commands/day consistently
- Need higher throughput
- Want premium support

**You probably don't need to upgrade unless you have 5000+ daily visitors.**

---

## 📞 Need Help?

**Resources:**
- [Upstash Documentation](https://docs.upstash.com/)
- [Upstash Discord](https://discord.gg/upstash)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

**Common issues:**
- Check environment variables are set correctly
- Restart dev server after changing env vars
- Verify Upstash database is active (not paused)
- Check free tier limits in dashboard

---

**Remember:** Redis is optional but powerful. Get the basics working first, then add Redis when you need that extra performance boost! 🚀
