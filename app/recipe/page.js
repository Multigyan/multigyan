import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category' // ✅ FIX: Import Category model for populate()
import RecipeListingClient from './RecipeListingClient'
import { Suspense } from 'react'

// =========================================
// RECIPE LISTING PAGE - ENHANCED WITH FILTERING
// =========================================
// Shows all recipe posts with filter/sort functionality
// URL: https://www.multigyan.in/recipe

export const metadata = {
  title: 'Recipes - Delicious Cooking Guides | Multigyan',
  description: 'Discover amazing recipes, cooking tips, and step-by-step culinary guides. From traditional dishes to modern cuisine.',
  keywords: ['recipes', 'cooking', 'food', 'cuisine', 'meals', 'dishes'],
}

// Revalidate every 60 seconds
export const revalidate = 60

export default async function RecipePage() {
  try {
    // Add timeout to database connection
    const dbPromise = connectDB()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    )

    await Promise.race([dbPromise, timeoutPromise])

    // Fetch all recipe posts with timeout
    const queryPromise = Post.find({
      status: 'published',
      contentType: 'recipe'
    })
      .populate('author', 'name profilePictureUrl username')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(100)
      .maxTimeMS(5000) // ✨ MongoDB query timeout
      .lean()

    const queryTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), 6000)
    )

    const recipePosts = await Promise.race([queryPromise, queryTimeoutPromise])

    // If no recipes found, show empty state instead of error
    if (recipePosts.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
                <ChefHat className="h-10 w-10" />
                Recipes Collection
              </h1>
              <p className="text-xl md:text-2xl text-green-50 mb-2">
                Delicious Recipes & Cooking Guides
              </p>
              <p className="text-green-100 max-w-2xl">
                From traditional family recipes to modern cuisine, discover delicious meals with step-by-step instructions.
              </p>
            </div>
          </div>

          {/* Empty State */}
          <div className="container mx-auto px-4 py-12">
            <div className="text-center py-16">
              <ChefHat className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-2xl text-gray-600 mb-4">
                No recipes available yet 🍳
              </p>
              <p className="text-gray-500 mb-6">
                Check back soon for delicious cooking guides!
              </p>
              <Link
                href="/blog"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Browse All Posts
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Serialize ObjectIds and Dates COMPLETELY
    const serializedPosts = recipePosts.map(post => {
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
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
              <ChefHat className="h-10 w-10" />
              Recipes Collection
            </h1>
            <p className="text-xl md:text-2xl text-green-50 mb-2">
              Delicious Recipes & Cooking Guides
            </p>
            <p className="text-green-100 max-w-2xl">
              From traditional family recipes to modern cuisine, discover delicious meals with step-by-step instructions.
            </p>
          </div>
        </div>

        {/* 🍳 Client Component with Filtering */}
        <Suspense fallback={
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-4">
                    <div className="h-48 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }>
          <RecipeListingClient initialPosts={serializedPosts} />
        </Suspense>

        {/* Call to Action */}
        <div className="container mx-auto px-4 py-12">
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-none">
            <CardContent className="p-8 text-white text-center">
              <ChefHat className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Have a Delicious Recipe to Share?
              </h2>
              <p className="text-xl text-green-50 mb-6 max-w-2xl mx-auto">
                Share your favorite recipes with our community and inspire home cooks around the world!
              </p>
              <Link
                href="/dashboard/posts/new"
                className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition shadow-lg"
              >
                Share Your Recipe
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading recipe posts:', error)

    // Determine error type for better user messaging
    const errorType = error.message.includes('timeout')
      ? 'timeout'
      : error.message.includes('connection')
        ? 'connection'
        : 'unknown'

    const errorMessages = {
      timeout: 'The request is taking too long. Please try again.',
      connection: 'Unable to connect to the database. Please try again later.',
      unknown: 'We couldn\'t load the recipes. Please try again later.'
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50/30">
        <Card className="max-w-md m-4">
          <CardContent className="p-8 text-center">
            <ChefHat className="h-16 w-16 text-green-600 mx-auto mb-4" />
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
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Go Home
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}
