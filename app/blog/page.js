"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Heart, 
  MessageCircle,
  TrendingUp,
  BookOpen
} from "lucide-react"
import { formatDate, calculateReadingTime } from "@/lib/helpers"

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch published posts
      const postsResponse = await fetch(`/api/posts?status=published&page=${currentPage}&limit=12`)
      if (!postsResponse.ok) {
        throw new Error('Failed to fetch posts')
      }
      const postsData = await postsResponse.json()
      
      // Fetch featured posts
      const featuredResponse = await fetch('/api/posts?status=published&featured=true&limit=3')
      if (!featuredResponse.ok) {
        throw new Error('Failed to fetch featured posts')
      }
      const featuredData = await featuredResponse.json()
      
      // Fetch categories with real-time counts
      const categoriesResponse = await fetch('/api/categories?includeCounts=true')
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories')
      }
      const categoriesData = await categoriesResponse.json()

      if (postsResponse.ok) {
        setPosts(postsData.posts || [])
        setPagination(postsData.pagination)
      }
      
      if (featuredResponse.ok) {
        setFeaturedPosts(featuredData.posts || [])
      }
      
      if (categoriesResponse.ok) {
        setCategories(categoriesData.categories || [])
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      // You could add a state here to show an error message to users
      // For example: setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    try {
      const response = await fetch(`/api/posts?status=published&search=${encodeURIComponent(searchTerm)}&limit=12`)
      const data = await response.json()
      
      if (response.ok) {
        setPosts(data.posts || [])
        setPagination(data.pagination)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error searching posts:', error)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setCurrentPage(1)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Enhanced Loading skeleton with shimmer effect */}
        <div className="container mx-auto px-4 py-8">
          {/* Hero skeleton with better shimmer */}
          <section className="bg-gradient-to-br from-background via-background to-muted/20 py-16 mb-16 rounded-lg">
            <div className="text-center mb-12 fade-in">
              <div className="skeleton-text h-12 w-64 mx-auto mb-4"></div>
              <div className="skeleton-text h-6 w-96 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main featured skeleton */}
              <div className="lg:col-span-2">
                <div className="skeleton h-80 w-full rounded-lg animate-shimmer"></div>
              </div>

              {/* Secondary featured skeletons */}
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-card rounded-lg border">
                    <div className="skeleton-circle w-24 h-24 flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="skeleton-text w-20 h-4"></div>
                      <div className="skeleton-text w-full h-4"></div>
                      <div className="skeleton-text w-3/4 h-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Posts grid skeleton */}
            <div className="lg:col-span-3">
              {/* Search skeleton */}
              <div className="mb-8 flex gap-4">
                <div className="skeleton h-10 flex-1"></div>
                <div className="skeleton h-10 w-24"></div>
              </div>

              {/* Section header skeleton */}
              <div className="mb-8 space-y-2">
                <div className="skeleton-text h-10 w-48"></div>
                <div className="skeleton-text h-5 w-96"></div>
              </div>

              {/* Posts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="blog-card border rounded-lg overflow-hidden scale-in">
                    <div className="skeleton h-48 w-full animate-shimmer"></div>
                    <div className="p-6 space-y-4">
                      <div className="skeleton-text w-24 h-5"></div>
                      <div className="skeleton-text w-full h-6"></div>
                      <div className="skeleton-text w-5/6 h-6"></div>
                      <div className="skeleton-text w-full h-4"></div>
                      <div className="skeleton-text w-4/5 h-4"></div>
                      <div className="flex justify-between mt-4">
                        <div className="skeleton-text w-32 h-4"></div>
                        <div className="skeleton-text w-40 h-4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-8">
              {/* Categories skeleton */}
              <div className="border rounded-lg p-6">
                <div className="skeleton-text h-6 w-32 mb-4"></div>
                <div className="skeleton-text h-4 w-48 mb-6"></div>
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton-text h-8 w-full"></div>
                  ))}
                </div>
              </div>

              {/* Newsletter skeleton */}
              <div className="border rounded-lg p-6">
                <div className="skeleton-text h-6 w-32 mb-4"></div>
                <div className="skeleton-text h-4 w-full mb-6"></div>
                <div className="skeleton h-10 w-full mb-4"></div>
                <div className="skeleton h-10 w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="bg-gradient-to-br from-background via-background to-muted/20 py-16 fade-in">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Featured <span className="title-gradient">Stories</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover our most popular and trending articles
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main featured post */}
              {featuredPosts[0] && (
                <Link href={`/blog/${featuredPosts[0].slug}`} className="lg:col-span-2 block slide-in">
                  <Card className="blog-card h-full overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group">
                    <div className="relative h-64 lg:h-80">
                      {featuredPosts[0].featuredImageUrl ? (
                        <Image
                          src={featuredPosts[0].featuredImageUrl}
                          alt={featuredPosts[0].featuredImageAlt || featuredPosts[0].title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-primary/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <Badge className="mb-2" style={{ backgroundColor: featuredPosts[0].category?.color }}>
                          {featuredPosts[0].category?.name}
                        </Badge>
                        <h2 className="text-2xl font-bold mb-2 line-clamp-2 group-hover:text-primary-foreground">
                          {featuredPosts[0].title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm opacity-90">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {featuredPosts[0].author?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(featuredPosts[0].publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {featuredPosts[0].readingTime} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )}

              {/* Secondary featured posts */}
              <div className="space-y-6">
                {featuredPosts.slice(1, 3).map((post, index) => (
                  <Link key={post._id} href={`/blog/${post.slug}`} className="block scale-in" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    <Card className="blog-card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group">
                      <div className="flex gap-4 p-4">
                        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded">
                          {post.featuredImageUrl ? (
                            <Image
                              src={post.featuredImageUrl}
                              alt={post.featuredImageAlt || post.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center rounded">
                              <BookOpen className="h-6 w-6 text-primary/60" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge 
                            size="sm" 
                            className="mb-2" 
                            style={{ backgroundColor: post.category?.color }}
                          >
                            {post.category?.name}
                          </Badge>
                          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            <span>{post.author?.name}</span>
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Posts Area */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-8 fade-in">
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit">Search</Button>
                  {searchTerm && (
                    <Button type="button" variant="outline" onClick={clearSearch}>
                      Clear
                    </Button>
                  )}
                </form>
              </div>

              {/* Section Header */}
              <div className="flex items-center justify-between mb-8 fade-in">
                <div>
                  <h2 className="text-3xl font-bold">
                    {searchTerm ? 'Search Results' : 'Latest Articles'}
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    {searchTerm 
                      ? `Found ${pagination?.total || 0} articles for "${searchTerm}"`
                      : 'Discover our latest insights and stories'
                    }
                  </p>
                </div>
              </div>

              {/* Posts Grid */}
              {posts.length === 0 ? (
                <Card className="scale-in">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm ? 'No articles found' : 'No articles published yet'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm 
                        ? 'Try adjusting your search terms or browse our categories.'
                        : 'Check back soon for new content!'
                      }
                    </p>
                    {searchTerm && (
                      <Button onClick={clearSearch}>
                        Browse All Articles
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {posts.map((post, index) => (
                      <Link key={post._id} href={`/blog/${post.slug}`} className="block scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <Card className="blog-card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group h-full">
                          <div className="relative h-48 overflow-hidden">
                            {post.featuredImageUrl ? (
                              <Image
                                src={post.featuredImageUrl}
                                alt={post.featuredImageAlt || post.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority={false}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
                              </div>
                            )}
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                          </div>
                          
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge style={{ backgroundColor: post.category?.color }}>
                                {post.category?.name}
                              </Badge>
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                              {post.excerpt}
                            </p>
                            
                            <div className="space-y-3">
                              {/* Author & Date */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {post.author?.profilePictureUrl ? (
                                    <Image
                                      src={post.author.profilePictureUrl}
                                      alt={post.author.name}
                                      width={24}
                                      height={24}
                                      className="rounded-full ring-2 ring-transparent group-hover:ring-primary transition-all"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary transition-all">
                                      <User className="h-3 w-3 text-primary" />
                                    </div>
                                  )}
                                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    {post.author?.name}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(post.publishedAt)}</span>
                                </div>
                              </div>

                              {/* Divider */}
                              <div className="border-t" />

                              {/* Stats */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
                                    <Clock className="h-3.5 w-3.5" />
                                    {post.readingTime} min
                                  </span>
                                  {post.views > 0 && (
                                    <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
                                      <Eye className="h-3.5 w-3.5" />
                                      {post.views}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 group-hover:bg-red-100 group-hover:scale-105 transition-all">
                                    <Heart className="h-3.5 w-3.5 fill-current" />
                                    <span className="text-xs font-semibold">{post.likes?.length || 0}</span>
                                  </span>
                                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-105 transition-all">
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    <span className="text-xs font-semibold">{post.comments?.filter(c => c.isApproved).length || 0}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 fade-in">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination.hasPrev}
                      >
                        Previous
                      </Button>
                      
                      <span className="flex items-center px-4 text-sm text-muted-foreground">
                        Page {pagination.current} of {pagination.pages}
                      </span>
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              {categories.length > 0 && (
                <Card className="fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Categories
                    </CardTitle>
                    <CardDescription>
                      Browse articles by topic
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.slice(0, 8).map((category) => (
                        <Link
                          key={category._id}
                          href={`/category/${category.slug}`}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">{category.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {category.postCount}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Newsletter Signup */}
              <Card className="fade-in">
                <CardHeader>
                  <CardTitle>Stay Updated</CardTitle>
                  <CardDescription>
                    Get the latest articles delivered to your inbox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                    />
                    <Button className="w-full">
                      Subscribe
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2">
                    No spam, unsubscribe anytime.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
