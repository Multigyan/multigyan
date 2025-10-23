// Migration script to add language field to existing posts
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://vipul:vipul229198112@multigyan.syong86.mongodb.net/test?retryWrites=true&w=majority&appName=Multigyan';

const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  lang: String,  // Changed from 'language' to 'lang'
  translationOf: mongoose.Schema.Types.ObjectId,
  content: String
}, { strict: false });

const Post = mongoose.models.Post || mongoose.model('posts', PostSchema);

async function migrateLanguages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // Get all posts without lang field
    const posts = await Post.find({
      $or: [
        { lang: { $exists: false } },
        { lang: null }
      ]
    });

    console.log(`📊 Found ${posts.length} posts without lang field\n`);

    if (posts.length === 0) {
      console.log('✅ All posts already have language field!');
      return;
    }

    // Detect language based on title content
    let englishCount = 0;
    let hindiCount = 0;

    for (const post of posts) {
      let detectedLang = 'en'; // Default to English

      // Simple Hindi detection - check for Devanagari characters
      const hindiPattern = /[\u0900-\u097F]/;
      if (hindiPattern.test(post.title) || hindiPattern.test(post.content || '')) {
        detectedLang = 'hi';
        hindiCount++;
      } else {
        englishCount++;
      }

      // Update post with detected language
      await Post.updateOne(
        { _id: post._id },
        { 
          $set: { 
            lang: detectedLang,  // Changed from 'language' to 'lang'
            translationOf: null // Will be set manually for translations
          } 
        }
      );

      console.log(`✅ Updated: ${post.title.substring(0, 50)}... → ${detectedLang}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Migration Summary:');
    console.log(`   English posts: ${englishCount}`);
    console.log(`   Hindi posts: ${hindiCount}`);
    console.log(`   Total updated: ${posts.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Migration completed successfully!');
    console.log('\n⚠️  Next Steps:');
    console.log('1. Review detected languages for accuracy');
    console.log('2. Manually link translations using translationOf field');
    console.log('3. Test language switcher on frontend');

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
migrateLanguages();
