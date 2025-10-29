import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Eye, ChefHat } from 'lucide-react'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

// =========================================
// RECIPE LISTING PAGE
// =========================================
// This page shows all recipe posts
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
    
    // Fetch all published recipe posts
    // Note: We'll use a 'recipe' tag to identify recipe posts
    const recipePosts = await Post.find({ 
      status: 'published',
      $or: [
        { tags: { $in: ['recipe', 'Recipe', 'recipes', 'Recipes', 'cooking', 'food'] } },
        // You can also add a specific category check if you create one
      ]
    })
      .populate('author', 'name profilePictureUrl')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(50) // Show latest 50 recipes
      .lean()

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
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
          {recipePosts.length === 0 ? (
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
              <div className="mb-8">
                <p className="text-gray-600">
                  Showing {recipePosts.length} Recipe{recipePosts.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recipePosts.map((post) => (
                  <Link
                    key={post._id.toString()}
                    href={`/recipe/${post.slug}`}
                    className="group"
                  >
                    <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      {/* Featured Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.featuredImageUrl || '/fallback.webp'}
                          alt={post.featuredImageAlt || post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Category Badge */}
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                              style={{ backgroundColor: post.category.color || '#16A34A' }}
                            >
                              <ChefHat className="w-3 h-3" />
                              {post.category.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition line-clamp-2">
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>

                        {/* Meta Information */}
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
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
                              <User className="w-5 h-5" />
                            )}
                            <span className="truncate max-w-[120px]">
                              {post.author?.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Call to Action */}
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
            <ChefHat className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Have a Delicious Recipe to Share?
            </h2>
            <p className="text-xl text-green-50 mb-6 max-w-2xl mx-auto">
              Share your favorite recipes with our community and inspire home cooks!
            </p>
            <Link
              href="/dashboard/posts/new"
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              Share Recipe
            </Link>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading recipe posts:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't load the recipes. Please try again later.
          </p>
          <Link
            href="/"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }
}
