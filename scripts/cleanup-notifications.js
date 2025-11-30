// Load environment variables FIRST
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
const envPath = join(__dirname, '../.env.local')
dotenv.config({ path: envPath })

// Verify MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in .env.local')
    console.error(`   Looked in: ${envPath}`)
    process.exit(1)
}

console.log('✅ Environment variables loaded')

/**
 * Cleanup old read notifications
 * Run this periodically (e.g., monthly) to keep database size manageable
 */
async function cleanupNotifications() {
    try {
        console.log('🧹 Starting notification cleanup...')

        // Dynamic imports after env is loaded
        const { default: connectDB } = await import('../lib/mongodb.js')
        const { default: Notification } = await import('../models/Notification.js')

        await connectDB()

        // Delete read notifications older than 90 days
        const daysOld = 90
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysOld)

        const result = await Notification.deleteMany({
            createdAt: { $lt: cutoffDate },
            isRead: true
        })

        console.log(`✅ Cleanup complete: Deleted ${result.deletedCount} old read notifications`)
        console.log(`   (Notifications older than ${daysOld} days)`)

        process.exit(0)
    } catch (error) {
        console.error('❌ Error during cleanup:', error)
        process.exit(1)
    }
}

cleanupNotifications()
