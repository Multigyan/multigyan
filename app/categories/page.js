import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Folder,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Calendar
} from "lucide-react"
import connectDB from "@/lib/mongodb"
import Category from "@/models/Category"
import { generateSEOMetadata } from "@/lib/seo"
import { getUnifiedStats } from "@/lib/stats"

// Revalidate every 60 seconds for fresh data
export const revalidate = 60

export const metadata = generateSEOMetadata({
  title: 'Categories - Browse Topics',
  description: 'Explore content by category on Multigyan. Find articles organized by technology, programming, design, business, and more topics.',
  keywords: ['categories', 'topics', 'content', 'blog categories', 'subjects'],
  canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/categories`,
  type: 'website'
})

export default async function CategoriesPage() {
  try {
    await connectDB()

    // ✅ Use centralized stats service
    const { stats, categoryStats } = await getUnifiedStats()

    // Get category details
    const categories = await Category.find({ isActive: true })
      .select('name slug description color postCount createdAt')
      .lean()

    // Combine category data with stats
    const categoriesWithStats = categories.map(category => {
      const categoryId = category._id.toString()
      const categoryStat = categoryStats[categoryId] || {}
      return {
        ...category,
        _id: categoryId,
        actualPostCount: categoryStat.postCount || 0,
        latestPost: categoryStat.latestPost,
        totalViews: categoryStat.totalViews || 0,
        createdAt: category.createdAt
      }
    })

    const activeCategories = categoriesWithStats
      .filter(cat => cat.actualPostCount > 0)
      .sort((a, b) => {
        if (b.actualPostCount !== a.actualPostCount) {
          return b.actualPostCount - a.actualPostCount
        }
        return a.name.localeCompare(b.name)
      })

    const totalCategories = stats.activeCategories
    const totalPosts = stats.totalPosts
    const totalViews = stats.totalViews
    const avgPostsPerCategory = stats.avgPostsPerCategory

    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12 fade-in">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Browse by <span className="inline-block animate-bounce-slow">Category</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Discover content organized by topics that interest you. From technology and
                  programming to design and business insights.
                </p>
              </div>

              {/* Stats Cards with Glassmorphism */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                <div className="fade-in bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 shadow-lg">
                    <Folder className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500 bg-clip-text text-transparent">{totalCategories}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Categories</div>
                </div>

                <div className="fade-in bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 shadow-lg">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">{totalPosts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Total Articles</div>
                </div>

                <div className="fade-in bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-4 shadow-lg">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 dark:from-green-400 dark:to-green-500 bg-clip-text text-transparent">{totalViews.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Total Views</div>
                </div>

                <div className="fade-in bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl mx-auto mb-4 shadow-lg">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 dark:from-pink-400 dark:to-pink-500 bg-clip-text text-transparent">{avgPostsPerCategory}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Avg. per Category</div>
                </div>
              </div>

              {/* Categories Grid */}
              {activeCategories.length > 0 ? (
                <>
                  {/* Popular Categories */}
                  <div className="mb-12 fade-in">
                    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">Popular Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeCategories.slice(0, 6).map((category, index) => (
                        <Link key={category._id} href={`/category/${category.slug}`} className="scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                          <Card className="blog-card h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-transparent hover:border-purple-500/50">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3 mb-3">
                                <div
                                  className="w-6 h-6 rounded-lg flex-shrink-0 transition-transform group-hover:scale-125 group-hover:rotate-12 shadow-lg"
                                  style={{ backgroundColor: category.color }}
                                />
                                <CardTitle className="text-xl line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                                  {category.name}
                                </CardTitle>
                                <Badge variant="secondary" className="ml-auto text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30">
                                  {category.actualPostCount} {category.actualPostCount === 1 ? 'post' : 'posts'}
                                </Badge>
                              </div>
                              {category.description && (
                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                  {category.description}
                                </p>
                              )}
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20">
                                    <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    {category.actualPostCount} articles
                                  </span>
                                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20">
                                    <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                    {category.totalViews.toLocaleString()} views
                                  </span>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
                              </div>
                              {category.latestPost && (
                                <div className="mt-3 pt-3 border-t border-border">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                    <span>
                                      Latest: {new Date(category.latestPost).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* All Categories */}
                  {activeCategories.length > 6 && (
                    <div className="fade-in">
                      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">All Categories</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {activeCategories.slice(6).map((category, index) => (
                          <Link key={category._id} href={`/category/${category.slug}`} className="scale-in" style={{ animationDelay: `${index * 30}ms` }}>
                            <Card className="blog-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className="w-4 h-4 rounded-md flex-shrink-0 transition-transform group-hover:scale-125 shadow-md"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {category.name}
                                  </h3>
                                </div>
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    {category.actualPostCount} {category.actualPostCount === 1 ? 'post' : 'posts'}
                                  </Badge>
                                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Card className="scale-in bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl">
                  <CardContent className="py-16 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                        <Folder className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
                        <p className="text-muted-foreground">
                          No categories with published content are available yet.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Browse All Content CTA */}
              <div className="mt-16 text-center fade-in">
                <Card className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border-2 border-purple-500/20 backdrop-blur-sm shadow-2xl">
                  <CardContent className="py-12 px-6">
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                      Can&#39;t Find What You&#39;re Looking For?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-lg">
                      Browse all articles or use the search function to find specific topics
                      and insights from our community of expert writers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/blog" className="scale-in">
                        <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-lg">Browse All Articles</div>
                              <div className="text-sm text-muted-foreground">Explore everything</div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-2 transition-transform ml-auto" />
                          </div>
                        </Card>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error loading categories:', error)

    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Categories</h1>
            <Card>
              <CardContent className="py-16">
                <p className="text-muted-foreground">
                  Unable to load categories at this time. Please try again later.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
}
