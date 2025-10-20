import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  // ✅ FIX: Return immediately if already connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // ✅ OPTIMIZED: Faster timeouts for Vercel serverless
      serverSelectionTimeoutMS: 3000, // Reduced to 3s for faster failures
      socketTimeoutMS: 8000, // Reduced to 8s to stay under 10s limit
      connectTimeoutMS: 3000, // Add connection timeout
      // ✅ OPTIMIZED: Better pooling for serverless
      maxPoolSize: 5, // Reduced pool size for serverless
      minPoolSize: 1, // Minimum 1 connection
      // ✅ ADD: Retry logic
      retryWrites: true,
      retryReads: true,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully')
        return mongoose
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error)
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('❌ Failed to connect to MongoDB:', e.message)
    throw e
  }

  return cached.conn
}

export default connectDB
export { connectDB }
