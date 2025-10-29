import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Eye, Wrench, Timer, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

// =========================================
// DIY LISTING PAGE - ENHANCED
// =========================================
// Shows all DIY tutorial posts with Phase 2 fields
// URL: https://www.multigyan.in/diy

export const metadata = {
  title: 'DIY Tutorials - Do It Yourself Projects | Multigyan',
  description: 'Explore creative DIY tutorials, craft projects, and step-by-step guides. Learn to make amazing things with your own hands.',
  keywords: ['DIY', 'tutorials', 'crafts', 'projects', 'handmade', 'creative'],
}

// Revalidate every 60 seconds
export const revalidate = 60

// Helper function for difficulty badge
function getDifficultyBadge(difficulty) {
  const configs = {
    easy: { color: 'bg-green-100 text-green-800 border-green-300', icon: '🟢', label: 'Easy' },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🟡', label: 'Medium' },
    hard: { color: 'bg-red-100 text-red-800 border-red-300', icon: '🔴', label: 'Hard' }
  }
  return configs[difficulty] || configs.medium
}

export default async function DIYPage() {
  try {
    await connectDB()
    
    // ✨ UPDATED: Use contentType field instead of tags
    const diyPosts = await Post.find({ 
      status: 'published',
      contentType: 'diy' // This is the new Phase 2 field!
    })
      .populate('author', 'name profilePictureUrl username')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean()

    // Serialize ObjectIds and Dates
    const serializedPosts = diyPosts.map(post => ({
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

        {/* Posts Grid */}
        <div className="container mx-auto px-4 py-12">
          {serializedPosts.length === 0 ? (
            <div className="text-center py-16">
              <Wrench className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <p className="text-2xl text-gray-600 mb-4">
                No DIY tutorials available yet 🎨
              </p>
              <p className="text-gray-500 mb-6">
                Check back soon for creative projects and tutorials!
              </p>
              <Link 
                href="/blog"
                className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
              >
                Browse All Posts
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-orange-600">{serializedPosts.length}</span> DIY Tutorial{serializedPosts.length !== 1 ? 's' : ''}
                </p>
                <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                  <Wrench className="w-3 h-3 mr-1" />
                  DIY Collection
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {serializedPosts.map((post) => {
                  const difficultyBadge = post.diyDifficulty ? getDifficultyBadge(post.diyDifficulty) : null
                  
                  return (
                    <Link
                      key={post._id}
                      href={`/diy/${post.slug}`}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border-orange-100">
                        {/* Featured Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.featuredImageUrl || '/fallback.webp'}
                            alt={post.featuredImageAlt || post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Difficulty Badge */}
                          {difficultyBadge && (
                            <div className="absolute top-4 left-4">
                              <Badge className={`${difficultyBadge.color} border font-semibold shadow-lg`}>
                                {difficultyBadge.icon} {difficultyBadge.label}
                              </Badge>
                            </div>
                          )}

                          {/* Category Badge */}
                          {post.category && (
                            <div className="absolute top-4 right-4">
                              <Badge 
                                className="text-white border-none shadow-lg"
                                style={{ backgroundColor: post.category.color || '#FF6B35' }}
                              >
                                {post.category.name}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <CardContent className="p-6 flex-1 flex flex-col">
                          {/* Title */}
                          <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition line-clamp-2">
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          <p className="text-gray-600 mb-4 line-clamp-2 flex-1 text-sm">
                            {post.excerpt}
                          </p>

                          {/* ✨ NEW: DIY Project Info */}
                          {(post.diyEstimatedTime || (post.diyMaterials && post.diyMaterials.length > 0)) && (
                            <div className="mb-4 p-3 bg-orange-50 rounded-lg space-y-2">
                              {post.diyEstimatedTime && (
                                <div className="flex items-center gap-2 text-sm text-orange-800">
                                  <Timer className="w-4 h-4" />
                                  <span className="font-medium">{post.diyEstimatedTime}</span>
                                </div>
                              )}
                              {post.diyMaterials && post.diyMaterials.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-orange-800">
                                  <Package className="w-4 h-4" />
                                  <span>{post.diyMaterials.length} materials needed</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Meta Information */}
                          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-orange-100">
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
                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-orange-600" />
                                </div>
                              )}
                              <span className="truncate max-w-[120px] font-medium text-gray-700">
                                {post.author?.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-orange-600" />
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Wrench className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn&#39;t load the DIY tutorials. Please try again later.
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
