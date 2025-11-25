import Link from 'next/link'
import { Wrench } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category' // ✅ FIX: Import Category model for populate()
import DIYListingClient from './DIYListingClient'

// =========================================
// DIY LISTING PAGE - ENHANCED WITH FILTERING
// =========================================
// Shows all DIY tutorial posts with filter/sort functionality
// URL: https://www.multigyan.in/diy

export const metadata = {
  title: 'DIY Tutorials - Do It Yourself Projects | Multigyan',
  description: 'Explore creative DIY tutorials, craft projects, and step-by-step guides. Learn to make amazing things with your own hands.',
  keywords: ['DIY', 'tutorials', 'crafts', 'projects', 'handmade', 'creative'],
}

// Revalidate every 60 seconds
export const revalidate = 60

export default async function DIYPage() {
  try {
    // Add timeout to database connection
    const dbPromise = connectDB()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    )

    await Promise.race([dbPromise, timeoutPromise])

    // Fetch all DIY posts with timeout
    const queryPromise = Post.find({
      status: 'published',
      contentType: 'diy'
    })
      .populate('author', 'name profilePictureUrl username')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(100)
      .maxTimeMS(5000) // MongoDB query timeout
      .lean()

    const queryTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), 6000)
    )

    const diyPosts = await Promise.race([queryPromise, queryTimeoutPromise])

    // Serialize ObjectIds and Dates COMPLETELY
    const serializedPosts = diyPosts.map(post => {
      // Helper function to convert ObjectId to string
      const serializeId = (id) => id ? id.toString() : null

      // Helper function to serialize array of ObjectIds
      const serializeIdArray = (arr) => arr ? arr.map(id => serializeId(id)) : []

      return {
        ...post,
        _id: serializeId(post._id),

        // Author
        author: post.author ? {
          ...post.author,
          _id: serializeId(post.author._id)
        } : null,

        // Category
        category: post.category ? {
          ...post.category,
          _id: serializeId(post.category._id)
        } : null,

        // Dates
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        createdAt: post.createdAt ? post.createdAt.toISOString() : null,
        updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
        reviewedAt: post.reviewedAt ? post.reviewedAt.toISOString() : null,

        // ObjectId fields
        reviewedBy: serializeId(post.reviewedBy),
        translationOf: serializeId(post.translationOf),
        lastEditedBy: serializeId(post.lastEditedBy),

        // Arrays of ObjectIds
        likes: serializeIdArray(post.likes),
        saves: serializeIdArray(post.saves),

        // Comments array
        comments: post.comments ? post.comments.map(comment => ({
          ...comment,
          _id: serializeId(comment._id),
          author: serializeId(comment.author),
          parentComment: serializeId(comment.parentComment),
          likes: serializeIdArray(comment.likes),
          createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
          updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : null,
          editedAt: comment.editedAt ? comment.editedAt.toISOString() : null
        })) : [],

        // Ratings array
        ratings: post.ratings ? post.ratings.map(rating => ({
          ...rating,
          _id: serializeId(rating._id),
          user: serializeId(rating.user),
          helpful: serializeIdArray(rating.helpful),
          createdAt: rating.createdAt ? rating.createdAt.toISOString() : null
        })) : [],

        // User photos array
        userPhotos: post.userPhotos ? post.userPhotos.map(photo => ({
          ...photo,
          _id: serializeId(photo._id),
          user: serializeId(photo.user),
          likes: serializeIdArray(photo.likes),
          createdAt: photo.createdAt ? photo.createdAt.toISOString() : null
        })) : [],

        // Include additional fields for filtering
        averageRating: post.averageRating || 0
      }
    })

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/30">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
              <Wrench className="h-10 w-10" />
              DIY Tutorials
            </h1>
            <p className="text-xl md:text-2xl text-orange-50 mb-2">
              Do It Yourself - Creative Projects & Tutorials
            </p>
            <p className="text-orange-100 max-w-2xl">
              Learn to create amazing things with step-by-step guides, from crafts to home improvements.
            </p>
          </div>
        </div>

        {/* 🎨 Client Component with Filtering */}
        <DIYListingClient initialPosts={serializedPosts} />

        {/* Call to Action */}
        <div className="container mx-auto px-4 py-12">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-none">
            <CardContent className="p-8 text-white text-center">
              <Wrench className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Have a DIY Project Idea?
              </h2>
              <p className="text-xl text-orange-50 mb-6 max-w-2xl mx-auto">
                Share your creative projects with our community and inspire others to create amazing things!
              </p>
              <Link
                href="/dashboard/posts/new"
                className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition shadow-lg"
              >
                Create DIY Tutorial
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading DIY posts:', error)

    // Determine error type for better messaging
    const errorType = error.message.includes('timeout')
      ? 'timeout'
      : error.message.includes('connection')
        ? 'connection'
        : 'unknown'

    const errorMessages = {
      timeout: 'The request is taking too long. Please try again.',
      connection: 'Unable to connect to the database. Please try again later.',
      unknown: 'We couldn\'t load the DIY tutorials. Please try again later.'
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50/30">
        <Card className="max-w-md m-4">
          <CardContent className="p-8 text-center">
            <Wrench className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-2">
              {errorMessages[errorType]}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Error: {error.message}
            </p>
            <Link
              href="/"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              Go Home
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}
