"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, PenTool, ArrowRight, TrendingUp, Sparkles } from "lucide-react"
import PostCard from "@/components/blog/PostCard"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatDate, getPostUrl } from "@/lib/helpers"
import { Calendar, Clock, Eye, User } from "lucide-react"
import HomeSchemas from "@/components/seo/HomeSchemas"

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalAuthors: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      // ✅ FIX: Fetch stats from dedicated public endpoint
      try {
        const statsResponse = await fetch('/api/stats/public', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats({
            totalPosts: statsData.totalPosts,
            totalAuthors: statsData.totalAuthors,
            totalCategories: statsData.totalCategories
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }

      // Fetch latest posts (separate from stats)
      try {
        const latestResponse = await fetch('/api/posts?status=published&limit=7', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (latestResponse.ok) {
          const latestData = await latestResponse.json()
          setLatestPosts(latestData.posts || [])
        }
      } catch (error) {
        console.error('Error fetching latest posts:', error)
      }

      // Fetch top 8 categories for display
      try {
        const categoriesResponse = await fetch('/api/categories/top?limit=8', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setTopCategories(categoriesData.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }

    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const featuredPost = latestPosts[0]
  const remainingPosts = latestPosts.slice(1, 7)

  if (loading) {
    return (
      <div className="min-h-screen">
        <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-5xl mx-auto animate-pulse">
              <div className="h-6 bg-muted rounded w-48 sm:w-64 mx-auto mb-6 sm:mb-8"></div>
              <div className="h-12 sm:h-16 bg-muted rounded w-full mb-4 sm:mb-6"></div>
              <div className="h-6 bg-muted rounded w-full sm:w-3/4 mx-auto mb-8 sm:mb-12"></div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <>
      {/* ✅ Schema Markup for SEO */}
      <HomeSchemas />

      <div className="min-h-screen">
        {/* ✅ Hero Section with Better Mobile Spacing */}
        <section className="relative overflow-hidden py-10 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-background via-primary/5 to-background">
          {/* Decorative Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              {/* ✅ Hero Text with Better Mobile Typography */}
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 rounded-full mb-4 sm:mb-6 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-primary">Explore Knowledge, Share Ideas</span>
                </div>

                {/* ✅ Better responsive text sizes */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 px-4">
                  Discover Insights.{" "}
                  <br className="hidden sm:block" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60">
                    Multiply Knowledge.
                  </span>
                </h1>

                {/* ✅ Better mobile text sizing */}
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 px-4">
                  Join our community of expert writers and curious readers.
                  Explore articles across technology, business, lifestyle, and more.
                </p>

                {/* ✅ Better mobile button layout */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10 md:mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-450 px-4">
                  <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-2xl hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto" asChild>
                    <Link href="/blog">
                      <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Explore Articles
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto" asChild>
                    <Link href="/register">
                      <PenTool className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Start Writing
                    </Link>
                  </Button>
                </div>
              </div>

              {/* ✅ Featured Latest Post with Better Mobile Layout */}
              {featuredPost && (
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-600">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 px-4 sm:px-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-bold">Latest Article</h2>
                  </div>

                  <Link href={getPostUrl(featuredPost)} className="block group">
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-primary/20 mx-4 sm:mx-0">
                      {/* ✅ Better mobile card layout - stack on mobile, side-by-side on tablet+ */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="relative h-56 sm:h-64 md:h-full overflow-hidden bg-muted">
                          {featuredPost.featuredImageUrl ? (
                            <Image
                              src={featuredPost.featuredImageUrl}
                              alt={featuredPost.featuredImageAlt || featuredPost.title}
                              fill
                              priority={true}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-primary/60" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                        </div>

                        {/* ✅ Content with better mobile padding */}
                        <CardContent className="p-5 sm:p-6 md:p-8 flex flex-col justify-center">
                          <Badge
                            className="w-fit mb-2 sm:mb-3 text-xs sm:text-sm"
                            style={{ backgroundColor: featuredPost.category?.color }}
                          >
                            {featuredPost.category?.name}
                          </Badge>

                          {/* ✅ Better mobile title sizing */}
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                            {featuredPost.title}
                          </h3>

                          {featuredPost.excerpt && (
                            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
                              {featuredPost.excerpt}
                            </p>
                          )}

                          {/* ✅ Better mobile meta layout - stack on very small screens */}
                          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              {featuredPost.author?.profilePictureUrl ? (
                                <Image
                                  src={featuredPost.author.profilePictureUrl}
                                  alt={featuredPost.author.name}
                                  width={20}
                                  height={20}
                                  className="rounded-full sm:w-6 sm:h-6"
                                />
                              ) : (
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                                </div>
                              )}
                              <span className="font-medium">{featuredPost.author?.name}</span>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{formatDate(featuredPost.publishedAt)}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{featuredPost.readingTime} min read</span>
                              </div>

                              {featuredPost.views > 0 && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>{featuredPost.views} views</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ✅ Latest 6 Posts Section with Better Mobile Spacing */}
        {remainingPosts.length > 0 && (
          <section className="py-12 sm:py-14 md:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 md:mb-12 gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-2 sm:mb-3 border border-primary/20">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">Latest</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
                    Recent <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Articles</span>
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Fresh insights and stories from our community
                  </p>
                </div>
                <Button variant="outline" asChild className="hidden sm:flex">
                  <Link href="/blog">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* ✅ Better responsive grid - 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8">
                {remainingPosts.map((post, index) => (
                  <div key={post._id} className="animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-8 sm:mt-10 sm:hidden">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/blog">
                    View All Articles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ✅ Category Section with Better Mobile Grid */}
        {topCategories.length > 0 && (
          <section className="py-12 sm:py-14 md:py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3 sm:mb-4 border border-primary/20">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Categories</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
                  Explore by <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Category</span>
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                  Discover content organized by topics that interest you
                </p>
              </div>

              {/* ✅ Better responsive grid - 1 col mobile (360px), 2 col sm, 3 col md, 4 col lg */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto mb-6 sm:mb-8">
                {topCategories.slice(0, 8).map((category, index) => (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug}`}
                    className="group"
                  >
                    {/* ✅ Better mobile card sizing and touch targets */}
                    <Card className="blog-card text-center h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer min-h-[140px] sm:min-h-[160px]">
                      <CardContent className="p-4 sm:p-5 md:p-6">
                        <div
                          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                          {category.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {category.postCount || 0} article{category.postCount !== 1 ? 's' : ''}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/categories">
                    View All Categories
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ✅ CTA Section with Better Mobile Stats */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              {/* ✅ Better mobile stats grid */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto mb-12 sm:mb-14 md:mb-16">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-1 sm:mb-2">
                    {stats.totalPosts > 0 ? `${stats.totalPosts}+` : '0'}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-1 sm:mb-2">
                    {stats.totalCategories > 0 ? `${stats.totalCategories}+` : '0'}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-1 sm:mb-2">
                    {stats.totalAuthors > 0 ? `${stats.totalAuthors}+` : '0'}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Authors</div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4">
                Ready to Start Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Journey</span>?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
                Join our community of writers and readers. Share your knowledge,
                discover new insights, and be part of the conversation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Button size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-2xl hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto" asChild>
                  <Link href="/register">
                    <PenTool className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                    Start Writing Today
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto" asChild>
                  <Link href="/blog">
                    <BookOpen className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                    Explore Content
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
