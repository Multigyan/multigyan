import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
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
    await connectDB()
    
    // Fetch all recipe posts
    const recipePosts = await Post.find({ 
      status: 'published',
      contentType: 'recipe'
    })
      .populate('author', 'name profilePictureUrl username')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(100) // Increased limit for better filtering
      .lean()

    // Serialize ObjectIds and Dates
    const serializedPosts = recipePosts.map(post => ({
      ...post,
      _id: post._id.toString(),
      author: post.author ? {
        ...post.author,
        _id: post.author._id.toString()
      } : null,
      category: post.category ? {
        ...post.category,
        _id: post.category._id.toString()
      } : null,
      publishedAt: post.publishedAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      // Include additional fields for filtering
      likes: post.likes || [],
      saves: post.saves || [],
      averageRating: post.averageRating || 0
    }))

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ChefHat className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn&#39;t load the recipes. Please try again later.
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
