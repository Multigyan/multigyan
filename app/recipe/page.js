import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import RecipeListingClient from './RecipeListingClient'

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
        <RecipeListingClient initialPosts={serializedPosts} />

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
