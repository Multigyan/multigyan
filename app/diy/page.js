import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Eye } from 'lucide-react'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

// =========================================
// DIY LISTING PAGE
// =========================================
// This page shows all DIY tutorial posts
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
    await connectDB()
    
    // Fetch all published DIY posts
    // Note: We'll use a 'diy' category or tag to identify DIY posts
    const diyPosts = await Post.find({ 
      status: 'published',
      $or: [
        { tags: { $in: ['diy', 'DIY', 'Do It Yourself'] } },
        // You can also add a specific category check if you create one
      ]
    })
      .populate('author', 'name profilePictureUrl')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(50) // Show latest 50 DIY posts
      .lean()

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🎨 DIY Tutorials
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
          {diyPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl text-gray-600 mb-4">
                No DIY tutorials available yet 😊
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
              <div className="mb-8">
                <p className="text-gray-600">
                  Showing {diyPosts.length} DIY Tutorial{diyPosts.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {diyPosts.map((post) => (
                  <Link
                    key={post._id.toString()}
                    href={`/diy/${post.slug}`}
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
                              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: post.category.color || '#FF6B35' }}
                            >
                              {post.category.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition line-clamp-2">
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
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Have a DIY Project Idea?
            </h2>
            <p className="text-xl text-orange-50 mb-6 max-w-2xl mx-auto">
              Share your creative projects with our community and inspire others!
            </p>
            <Link
              href="/dashboard/posts/new"
              className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
            >
              Create Tutorial
            </Link>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading DIY posts:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't load the DIY tutorials. Please try again later.
          </p>
          <Link
            href="/"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }
}
