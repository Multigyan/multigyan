/**
 * Fix Script: Activate All Inactive Newsletter Subscribers
 * 
 * This script activates all subscribers that are currently inactive.
 * Useful when switching from double opt-in to instant activation.
 * 
 * Run with: node scripts/fix-newsletter-subscribers.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Newsletter Schema (inline to avoid import issues)
const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  source: String,
  preferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }]
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  }
}, {
  timestamps: true
});

async function fixNewsletterSubscribers() {
  try {
    console.log('🔧 Starting Newsletter Subscriber Fix Script...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get Newsletter model
    const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);

    // Find all inactive subscribers
    console.log('🔍 Finding inactive subscribers...');
    const inactiveSubscribers = await Newsletter.find({ isActive: false });
    console.log(`📊 Found ${inactiveSubscribers.length} inactive subscribers\n`);

    if (inactiveSubscribers.length === 0) {
      console.log('✅ No inactive subscribers found. All good!\n');
      await mongoose.connection.close();
      return;
    }

    // Show subscribers before update
    console.log('📋 Inactive Subscribers:');
    inactiveSubscribers.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.email} - Source: ${sub.source || 'unknown'}`);
    });
    console.log('');

    // Update all inactive subscribers to active
    console.log('🔄 Activating all inactive subscribers...');
    const result = await Newsletter.updateMany(
      { isActive: false },
      {
        $set: {
          isActive: true,
          unsubscribedAt: null
        }
      }
    );

    console.log(`✅ Successfully activated ${result.modifiedCount} subscribers!\n`);

    // Verify the update
    console.log('🔍 Verifying update...');
    const stats = await Newsletter.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('📊 Final Statistics:');
      console.log(`   Total Subscribers: ${stats[0].total}`);
      console.log(`   Active: ${stats[0].active}`);
      console.log(`   Inactive: ${stats[0].inactive}`);
      console.log('');
    }

    console.log('✅ Fix completed successfully!\n');
    console.log('💡 Tip: Refresh your admin panel to see the updated status\n');

    // Close connection
    await mongoose.connection.close();
    console.log('👋 Connection closed. Done!\n');

  } catch (error) {
    console.error('❌ Error fixing newsletter subscribers:', error);
    process.exit(1);
  }
}

// Run the script
fixNewsletterSubscribers();
