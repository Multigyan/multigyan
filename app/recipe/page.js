import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Eye, ChefHat, Timer, CookingPot, Users, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

// =========================================
// RECIPE LISTING PAGE - ENHANCED
// =========================================
// Shows all recipe posts with Phase 2 fields
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
    
    // ✨ UPDATED: Use contentType field instead of tags
    const recipePosts = await Post.find({ 
      status: 'published',
      contentType: 'recipe' // This is the new Phase 2 field!
    })
      .populate('author', 'name profilePictureUrl username')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(50)
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
      updatedAt: post.updatedAt.toISOString()
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

        {/* Posts Grid */}
        <div className="container mx-auto px-4 py-12">
          {serializedPosts.length === 0 ? (
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
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-green-600">{serializedPosts.length}</span> Recipe{serializedPosts.length !== 1 ? 's' : ''}
                </p>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <ChefHat className="w-3 h-3 mr-1" />
                  Recipe Collection
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {serializedPosts.map((post) => {
                  const totalTime = post.recipePrepTime && post.recipeCookTime 
                    ? `${post.recipePrepTime} + ${post.recipeCookTime}`
                    : post.recipePrepTime || post.recipeCookTime || null
                  
                  return (
                    <Link
                      key={post._id}
                      href={`/recipe/${post.slug}`}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border-green-100">
                        {/* Featured Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.featuredImageUrl || '/fallback.webp'}
                            alt={post.featuredImageAlt || post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Cuisine Badge */}
                          {post.recipeCuisine && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-green-600 text-white border-none shadow-lg font-semibold">
                                {post.recipeCuisine.charAt(0).toUpperCase() + post.recipeCuisine.slice(1)}
                              </Badge>
                            </div>
                          )}

                          {/* Category Badge */}
                          {post.category && (
                            <div className="absolute top-4 right-4">
                              <Badge 
                                className="text-white border-none shadow-lg"
                                style={{ backgroundColor: post.category.color || '#16A34A' }}
                              >
                                {post.category.name}
                              </Badge>
                            </div>
                          )}

                          {/* Diet Tags (if any) */}
                          {post.recipeDiet && post.recipeDiet.length > 0 && (
                            <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
                              {post.recipeDiet.slice(0, 2).map((diet, idx) => (
                                <Badge 
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs bg-white/90 text-green-800 border-green-200"
                                >
                                  <CheckCircle2 className="w-2 h-2 mr-1" />
                                  {diet.split('-')[0]}
                                </Badge>
                              ))}
                              {post.recipeDiet.length > 2 && (
                                <Badge 
                                  variant="secondary"
                                  className="text-xs bg-white/90 text-green-800 border-green-200"
                                >
                                  +{post.recipeDiet.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <CardContent className="p-6 flex-1 flex flex-col">
                          {/* Title */}
                          <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition line-clamp-2">
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          <p className="text-gray-600 mb-4 line-clamp-2 flex-1 text-sm">
                            {post.excerpt}
                          </p>

                          {/* ✨ NEW: Recipe Info */}
                          {(totalTime || post.recipeServings || (post.recipeIngredients && post.recipeIngredients.length > 0)) && (
                            <div className="mb-4 p-3 bg-green-50 rounded-lg space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                {totalTime && (
                                  <div className="flex items-center gap-2 text-sm text-green-800">
                                    <Timer className="w-4 h-4 text-green-600" />
                                    <span className="font-medium">{totalTime}</span>
                                  </div>
                                )}
                                {post.recipeServings && (
                                  <div className="flex items-center gap-2 text-sm text-green-800">
                                    <Users className="w-4 h-4 text-green-600" />
                                    <span className="font-medium">{post.recipeServings}</span>
                                  </div>
                                )}
                              </div>
                              {post.recipeIngredients && post.recipeIngredients.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-green-800">
                                  <CookingPot className="w-4 h-4 text-green-600" />
                                  <span>{post.recipeIngredients.length} ingredients</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Meta Information */}
                          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-green-100">
                            <div className="flex items-center gap-2">
                              {post.author?.profilePictureUrl ? (
                                <Image
                                  src={post.author.profilePictureUrl}
                                  alt={post.author.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-green-600" />
                                </div>
                              )}
                              <span className="truncate max-w-[120px] font-medium text-gray-700">
                                {post.author?.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-green-600" />
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-green-600" />
                                {post.views || 0}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>

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
