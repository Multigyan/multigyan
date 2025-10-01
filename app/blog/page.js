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
  }, [currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch published posts
      const postsResponse = await fetch(`/api/posts?status=published&page=${currentPage}&limit=12`)
      const postsData = await postsResponse.json()
      
      // Fetch featured posts
      const featuredResponse = await fetch('/api/posts?status=published&featured=true&limit=3')
      const featuredData = await featuredResponse.json()
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories')
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
        {/* Loading skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Hero skeleton */}
            <div className="h-96 bg-muted rounded-lg mb-12"></div>
            
            {/* Posts grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-muted rounded-lg"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
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
        <section className="bg-gradient-to-br from-background via-background to-muted/20 py-16">
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
                <div className="lg:col-span-2">
                  <Card className="blog-card h-full overflow-hidden">
                    <div className="relative h-64 lg:h-80">
                      {featuredPosts[0].featuredImageUrl ? (
                        <Image
                          src={featuredPosts[0].featuredImageUrl}
                          alt={featuredPosts[0].featuredImageAlt || featuredPosts[0].title}
                          fill
                          className="object-cover"
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
                        <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                          <Link href={`/blog/${featuredPosts[0].slug}`} className="hover:text-primary-foreground">
                            {featuredPosts[0].title}
                          </Link>
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
                </div>
              )}

              {/* Secondary featured posts */}
              <div className="space-y-6">
                {featuredPosts.slice(1, 3).map((post) => (
                  <Card key={post._id} className="blog-card overflow-hidden">
                    <div className="flex gap-4 p-4">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        {post.featuredImageUrl ? (
                          <Image
                            src={post.featuredImageUrl}
                            alt={post.featuredImageAlt || post.title}
                            fill
                            className="object-cover rounded"
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
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                            {post.title}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{post.author?.name}</span>
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
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
              <div className="mb-8">
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
              <div className="flex items-center justify-between mb-8">
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
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm ? 'No articles found' : 'No articles published yet'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? 'Try adjusting your search terms or browse our categories.'
                        : 'Check back soon for new content!'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {posts.map((post) => (
                      <Card key={post._id} className="blog-card overflow-hidden">
                        <div className="relative h-48">
                          {post.featuredImageUrl ? (
                            <Image
                              src={post.featuredImageUrl}
                              alt={post.featuredImageAlt || post.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-primary/60" />
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge style={{ backgroundColor: post.category?.color }}>
                              {post.category?.name}
                            </Badge>
                          </div>
                          
                          <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                            <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                              {post.title}
                            </Link>
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between">
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
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-primary" />
                                </div>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {post.author?.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(post.publishedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readingTime} min
                              </span>
                              {post.views > 0 && (
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {post.views}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {post.comments?.filter(c => c.isApproved).length || 0}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex justify-center gap-2">
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
                <Card>
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
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm font-medium">{category.name}</span>
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
              <Card>
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