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
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Browse by <span className="title-gradient">Category</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Discover content organized by topics that interest you. From technology and
                programming to design and business insights.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <Card className="fade-in">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 pulse-once">
                    <Folder className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{totalCategories}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </CardContent>
              </Card>

              <Card className="fade-in" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mx-auto mb-4 pulse-once" style={{ animationDelay: '100ms' }}>
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{totalPosts}</div>
                  <div className="text-sm text-muted-foreground">Total Articles</div>
                </CardContent>
              </Card>

              <Card className="fade-in" style={{ animationDelay: '200ms' }}>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mx-auto mb-4 pulse-once" style={{ animationDelay: '200ms' }}>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </CardContent>
              </Card>

              <Card className="fade-in" style={{ animationDelay: '300ms' }}>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-lg mx-auto mb-4 pulse-once" style={{ animationDelay: '300ms' }}>
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{avgPostsPerCategory}</div>
                  <div className="text-sm text-muted-foreground">Avg. per Category</div>
                </CardContent>
              </Card>
            </div>

            {/* Categories Grid */}
            {activeCategories.length > 0 ? (
              <>
                {/* Popular Categories */}
                <div className="mb-12 fade-in">
                  <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCategories.slice(0, 6).map((category, index) => (
                      <Link key={category._id} href={`/category/${category.slug}`} className="scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <Card className="blog-card h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3 mb-3">
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                                style={{ backgroundColor: category.color }}
                              />
                              <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                {category.name}
                              </CardTitle>
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {category.actualPostCount} {category.actualPostCount === 1 ? 'post' : 'posts'}
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {category.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {category.actualPostCount} articles
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {category.totalViews.toLocaleString()} views
                                </span>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                            {category.latestPost && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
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
                    <h2 className="text-2xl font-bold mb-6">All Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {activeCategories.slice(6).map((category, index) => (
                        <Link key={category._id} href={`/category/${category.slug}`} className="scale-in" style={{ animationDelay: `${index * 30}ms` }}>
                          <Card className="blog-card transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                                  style={{ backgroundColor: category.color }}
                                />
                                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                  {category.name}
                                </h3>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {category.actualPostCount} {category.actualPostCount === 1 ? 'post' : 'posts'}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
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
              <Card className="scale-in">
                <CardContent className="py-16 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center pulse-once">
                      <Folder className="h-8 w-8 text-muted-foreground" />
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
              <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                <CardContent className="py-12 px-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Can&apos;t Find What You&apos;re Looking For?
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Browse all articles or use the search function to find specific topics
                    and insights from our community of expert writers.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/blog" className="scale-in">
                      <Card className="p-4 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-6 w-6 text-primary" />
                          <div>
                            <div className="font-semibold">Browse All Articles</div>
                            <div className="text-sm text-muted-foreground">Explore everything</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
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
