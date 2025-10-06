"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, PenTool, ArrowRight, TrendingUp, Sparkles, RefreshCw, AlertCircle } from "lucide-react"
import PostCard from "@/components/blog/PostCard"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/helpers"
import { Calendar, Clock, Eye, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalAuthors: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState({
    posts: true,
    categories: true,
    authors: true
  })
  const [errors, setErrors] = useState({
    posts: null,
    categories: null,
    authors: null
  })

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    await Promise.all([
      fetchLatestPosts(),
      fetchTopCategories(),
      fetchAuthorsCount()
    ])
  }

  // Fetch latest posts with error handling
  const fetchLatestPosts = async () => {
    try {
      setLoading(prev => ({ ...prev, posts: true }))
      setErrors(prev => ({ ...prev, posts: null }))

      const response = await fetch('/api/posts?status=published&limit=7')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`)
      }

      const data = await response.json()
      
      setLatestPosts(data.posts || [])
      setStats(prev => ({
        ...prev,
        totalPosts: data.pagination?.total || 0
      }))
    } catch (error) {
      console.error('Error fetching latest posts:', error)
      setErrors(prev => ({ 
        ...prev, 
        posts: 'Failed to load latest articles. Please try again.' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, posts: false }))
    }
  }

  // Fetch top categories with error handling
  const fetchTopCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }))
      setErrors(prev => ({ ...prev, categories: null }))

      const response = await fetch('/api/categories/top?limit=8')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`)
      }

      const data = await response.json()
      
      setTopCategories(data.categories || [])
      setStats(prev => ({
        ...prev,
        totalCategories: data.total || 0
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      setErrors(prev => ({ 
        ...prev, 
        categories: 'Failed to load categories. Please try again.' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, categories: false }))
    }
  }

  // Fetch authors count with error handling
  const fetchAuthorsCount = async () => {
    try {
      setLoading(prev => ({ ...prev, authors: true }))
      setErrors(prev => ({ ...prev, authors: null }))

      const response = await fetch('/api/users/authors')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch authors: ${response.status}`)
      }

      const data = await response.json()
      
      setStats(prev => ({
        ...prev,
        totalAuthors: data.total || 0
      }))
    } catch (error) {
      console.error('Error fetching authors:', error)
      setErrors(prev => ({ 
        ...prev, 
        authors: 'Failed to load author count.' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, authors: false }))
    }
  }

  // Refresh all data
  const handleRefresh = () => {
    fetchHomeData()
  }

  const featuredPost = latestPosts[0]
  const remainingPosts = latestPosts.slice(1, 7)

  // Check if all data is still loading
  const isInitialLoading = loading.posts && loading.categories && loading.authors

  if (isInitialLoading) {
    return (
      <div className="min-h-screen">
        <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-5xl mx-auto animate-pulse">
              <div className="h-6 bg-muted rounded w-64 mx-auto mb-8"></div>
              <div className="h-16 bg-muted rounded w-full mb-6"></div>
              <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-12"></div>
              <div className="flex gap-4 justify-center">
                <div className="h-12 bg-muted rounded w-40"></div>
                <div className="h-12 bg-muted rounded w-40"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Featured Latest Post */}
      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-br from-background via-primary/5 to-background">
        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Text */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Explore Knowledge, Share Ideas</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                Discover Insights.{" "}
                <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60">
                  Multiply Knowledge.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                Join our community of expert writers and curious readers. 
                Explore articles across technology, business, lifestyle, and more.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-450">
                <Button size="lg" className="text-lg px-8 py-6 shadow-2xl hover:shadow-xl transition-all hover:scale-105" asChild>
                  <Link href="/blog">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Explore Articles
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105" asChild>
                  <Link href="/register">
                    <PenTool className="mr-2 h-5 w-5" />
                    Start Writing
                  </Link>
                </Button>
              </div>
            </div>

            {/* Error Alert for Posts */}
            {errors.posts && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{errors.posts}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchLatestPosts}
                    disabled={loading.posts}
                  >
                    {loading.posts ? "Loading..." : "Retry"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Featured Latest Post */}
            {loading.posts ? (
              <div className="animate-pulse">
                <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                <Card className="overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="h-64 md:h-96 bg-muted"></div>
                    <div className="p-6 md:p-8">
                      <div className="h-6 bg-muted rounded w-24 mb-4"></div>
                      <div className="h-8 bg-muted rounded w-full mb-4"></div>
                      <div className="h-20 bg-muted rounded w-full mb-6"></div>
                      <div className="flex gap-4">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : featuredPost ? (
              <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-600">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Latest Article</h2>
                </div>
                
                <Link href={`/blog/${featuredPost.slug}`} className="block group">
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-primary/20">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Image */}
                      <div className="relative h-64 md:h-full overflow-hidden bg-muted">
                        {featuredPost.featuredImageUrl ? (
                          <Image
                            src={featuredPost.featuredImageUrl}
                            alt={featuredPost.featuredImageAlt || featuredPost.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-primary/60" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      </div>

                      {/* Content */}
                      <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                        <Badge 
                          className="w-fit mb-3" 
                          style={{ backgroundColor: featuredPost.category?.color }}
                        >
                          {featuredPost.category?.name}
                        </Badge>
                        
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                          {featuredPost.title}
                        </h3>
                        
                        {featuredPost.excerpt && (
                          <p className="text-muted-foreground mb-6 line-clamp-3">
                            {featuredPost.excerpt}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {featuredPost.author?.profilePictureUrl ? (
                              <Image
                                src={featuredPost.author.profilePictureUrl}
                                alt={featuredPost.author.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                            )}
                            <span>{featuredPost.author?.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(featuredPost.publishedAt)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{featuredPost.readingTime} min read</span>
                          </div>

                          {featuredPost.views > 0 && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{featuredPost.views} views</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </div>
            ) : !errors.posts ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No articles available yet. Be the first to create one!
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        </div>
      </section>

      {/* Latest 6 Posts Section */}
      {(remainingPosts.length > 0 || loading.posts) && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3 border border-primary/20">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Latest</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Recent <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Articles</span>
                </h2>
                <p className="text-muted-foreground">
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

            {loading.posts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="h-48 bg-muted"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-20 mb-3"></div>
                      <div className="h-6 bg-muted rounded w-full mb-3"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {remainingPosts.map((post, index) => (
                  <div key={post._id} className="animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-10 sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/blog">
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Explore by Category Section */}
      {(topCategories.length > 0 || loading.categories) && (
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Categories</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Explore by <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Category</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover content organized by topics that interest you
              </p>
            </div>

            {/* Error Alert for Categories */}
            {errors.categories && (
              <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{errors.categories}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchTopCategories}
                    disabled={loading.categories}
                  >
                    {loading.categories ? "Loading..." : "Retry"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Top 8 Categories Grid - 2 rows x 4 columns */}
            {loading.categories ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto mb-8">
                {[...Array(8)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto mb-8">
                {topCategories.slice(0, 8).map((category, index) => (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug}`}
                    className="group"
                  >
                    <Card className="blog-card text-center h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6">
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <div
                            className="w-10 h-10 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.postCount || 0} article{category.postCount !== 1 ? 's' : ''}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/categories">
                  View All Categories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section with Stats */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Stats with Loading States */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
              <div className="text-center">
                {loading.posts ? (
                  <div className="animate-pulse">
                    <div className="h-12 bg-muted rounded w-20 mx-auto mb-2"></div>
                    <div className="h-4 bg-muted rounded w-16 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-2">
                      {stats.totalPosts > 0 ? `${stats.totalPosts}+` : '0'}
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground font-medium">Articles</div>
                  </>
                )}
              </div>
              <div className="text-center">
                {loading.categories ? (
                  <div className="animate-pulse">
                    <div className="h-12 bg-muted rounded w-20 mx-auto mb-2"></div>
                    <div className="h-4 bg-muted rounded w-16 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-2">
                      {stats.totalCategories > 0 ? `${stats.totalCategories}+` : '0'}
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground font-medium">Categories</div>
                  </>
                )}
              </div>
              <div className="text-center">
                {loading.authors ? (
                  <div className="animate-pulse">
                    <div className="h-12 bg-muted rounded w-20 mx-auto mb-2"></div>
                    <div className="h-4 bg-muted rounded w-16 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-2">
                      {stats.totalAuthors > 0 ? `${stats.totalAuthors}+` : '0'}
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground font-medium">Authors</div>
                  </>
                )}
              </div>
            </div>

            {/* Refresh Button */}
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading.posts || loading.categories || loading.authors}
                className="text-muted-foreground hover:text-primary"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${(loading.posts || loading.categories || loading.authors) ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Journey</span>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join our community of writers and readers. Share your knowledge, 
              discover new insights, and be part of the conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-10 py-7 shadow-2xl hover:shadow-xl transition-all hover:scale-105" asChild>
                <Link href="/register">
                  <PenTool className="mr-2 h-6 w-6" />
                  Start Writing Today
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all hover:scale-105" asChild>
                <Link href="/blog">
                  <BookOpen className="mr-2 h-6 w-6" />
                  Explore Content
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
