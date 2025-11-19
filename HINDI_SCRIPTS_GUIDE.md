# 🎯 HINDI BLOG SCRIPTS - USAGE GUIDE

## 📋 Two Scripts Available

### 1. **Check Script** (check-hindi-blogs.js)
Shows detailed information about your Hindi blogs

### 2. **Update Script** (fix-hindi-slugs.js)
Converts Hindi blog URLs to SEO-friendly transliterated slugs

---

## ⚡ QUICK START (3 Steps)

### Step 1: Check What You Have
```bash
node scripts/check-hindi-blogs.js
```

**What it shows:**
- Total Hindi blogs count
- Status breakdown (published/draft/pending)
- Each blog's current slug and length
- Which blogs need URL updates
- Recommendations

**Example Output:**
```
📊 HINDI BLOG ANALYSIS
==========================================================================

📈 OVERALL STATISTICS:
──────────────────────────────────────────────────────────────────────────
   Total Posts: 181
   English Posts: 180
   Hindi Posts: 1
   Posts without language: 0

📝 HINDI POSTS BY STATUS:
──────────────────────────────────────────────────────────────────────────
   Published: 1
   Draft: 0
   Pending Review: 0

📋 HINDI POSTS DETAILS:
──────────────────────────────────────────────────────────────────────────

1. PMAY 2025: पात्रता, आवेदन स्थिति (स्टेटस) और सब्सिडी प्राप्त करने की पूरी गाइड
   Status: published
   Current Slug: pmay-2025
   Linked Translation: Yes ✓
   Created: 11/19/2025
   URL: https://www.multigyan.in/blog/pmay-2025
   ⚠️  WARNING: Slug is very short (9 chars) - likely needs update

==========================================================================

🎯 SUMMARY:
──────────────────────────────────────────────────────────────────────────
   Total Hindi posts: 1
   Posts with short slugs: 1
   Posts that need updating: 1

   Posts needing slug updates:
   • PMAY 2025: पात्रता, आवेदन स्थिति (स्टेटस) और सब्सिडी प्राप्त करने की पूरी गाइड
     Current: pmay-2025 (9 chars)

💡 RECOMMENDATION:
   Run the update script to fix these slugs:
   node scripts/fix-hindi-slugs.js
```

---

### Step 2: Update the Slugs
```bash
node scripts/fix-hindi-slugs.js
```

**What it does:**
- Shows which posts will be updated
- Asks for confirmation (type "yes")
- Updates slugs in database
- Shows new URLs

**Example Output:**
```
🔄 HINDI SLUG UPDATE TOOL

Found 1 Hindi post(s)

POSTS TO UPDATE:

1. PMAY 2025: पात्रता, आवेदन स्थिति (स्टेटस) और सब्सिडी प्राप्त करने की पूरी गाइड
   OLD: pmay-2025
   NEW: pmay-2025-patrta-aavedan-sthiti-status-aur-sabsidi-prapt-karne-ki-puri-guide

Proceed? (yes/no): yes

Updating...

✅ PMAY 2025: पात्रता, आवेदन स्थिति (स्टेटस) और सब्सिडी प्राप्त करने की पूरी गाइड
   pmay-2025 → pmay-2025-patrta-aavedan-sthiti-status-aur-sabsidi-prapt-karne-ki-puri-guide

✅ Update completed!
```

---

### Step 3: Verify Changes
```bash
node scripts/check-hindi-blogs.js
```

Should now show:
```
✅ All Hindi post slugs look good!
```

---

## 🛡️ SAFE TO USE

Both scripts are safe because:
- ✅ Check script is **read-only** (doesn't change anything)
- ✅ Update script asks for **confirmation** before making changes
- ✅ Handles **slug collisions** automatically
- ✅ Shows **detailed preview** before updating

---

## 🚀 ADVANCED OPTIONS

### Auto-confirm (skip "yes" prompt)
```bash
node scripts/fix-hindi-slugs.js --yes
# or
node scripts/fix-hindi-slugs.js -y
```

**Use case:** When you're sure and want to automate

---

## 📊 WHAT GETS UPDATED

### Before:
```
Title: "PMAY 2025: पात्रता और सब्सिडी"
Slug:  "pmay-2025"
URL:   multigyan.in/blog/pmay-2025
```

### After:
```
Title: "PMAY 2025: पात्रता और सब्सिडी"  (unchanged)
Slug:  "pmay-2025-patrta-aur-sabsidi"
URL:   multigyan.in/blog/pmay-2025-patrta-aur-sabsidi
```

**What's transliterated:**
- पात्रता → patrta (eligibility)
- आवेदन → aavedan (application)
- स्थिति → sthiti (status)
- सब्सिडी → sabsidi (subsidy)
- प्राप्त → prapt (receive)

---

## 🔧 TROUBLESHOOTING

### "MONGODB_URI not found"
**Fix:** Check your `.env.local` file exists and has:
```
MONGODB_URI=mongodb+srv://...
```

### "No Hindi posts found"
**Causes:**
1. No posts with `lang: 'hi'` field
2. Wrong database connection
3. Posts are in different collection

**Check in MongoDB:**
```javascript
db.posts.find({ lang: 'hi' })
```

### "All slugs already optimized"
**Meaning:** Your Hindi blogs already have good URLs! ✅  
No action needed.

---

## 📝 WORKFLOW EXAMPLE

**Scenario:** You have 5 Hindi blogs with short URLs

```bash
# Step 1: Check status
node scripts/check-hindi-blogs.js

# Output shows 5 blogs need updates

# Step 2: Update them
node scripts/fix-hindi-slugs.js

# Confirm with "yes"

# Step 3: Verify
node scripts/check-hindi-blogs.js

# All good! ✅
```

---

## 🎯 WHEN TO USE THESE SCRIPTS

### Use Check Script:
- ✅ Before making any changes
- ✅ To audit your Hindi content
- ✅ To see what needs updating
- ✅ After updates to verify

### Use Update Script:
- ✅ When check script shows blogs need updates
- ✅ After publishing new Hindi blogs (if URLs are short)
- ✅ When migrating to better SEO URLs

---

## ⚠️ IMPORTANT NOTES

1. **Backup First** (if in production)
   ```bash
   # MongoDB Atlas: Use backup feature
   ```

2. **URL Changes**
   - Old URLs won't work after update
   - Set up 301 redirects if in production
   - Update sitemap.xml

3. **Run Locally First**
   - Test on localhost before production
   - Verify URLs work after update

4. **SEO Impact**
   - Positive: Better keywords in URL
   - Temporary: May lose some rankings during transition
   - Long-term: Better SEO with descriptive URLs

---

## ✅ SUCCESS CRITERIA

After running both scripts, you should have:

```
[ ] All Hindi blogs identified
[ ] Slugs updated to full transliteration
[ ] URLs are SEO-friendly (40+ characters)
[ ] No slug collisions
[ ] All URLs accessible
[ ] Language switcher works
```

---

## 🎉 THAT'S IT!

You now have two powerful scripts to manage your Hindi blog URLs:

1. **check-hindi-blogs.js** - Diagnostic tool
2. **fix-hindi-slugs.js** - Update tool

**Simple workflow:**
```
Check → Update → Verify → Done! ✅
```

---

**Need help?** Check the detailed documentation or ask me!

*Last updated: November 19, 2025*
