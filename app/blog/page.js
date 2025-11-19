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
import { formatDate, calculateReadingTime, getPostUrl } from "@/lib/helpers"
import AdSense from "@/components/AdSense" // ✅ Import AdSense

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
      
      // 🐛 FIX: Exclude recipes from blog listing
      const postsResponse = await fetch(`/api/posts?status=published&excludeRecipes=true&page=${currentPage}&limit=12`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!postsResponse.ok) {
        throw new Error('Failed to fetch posts')
      }
      const postsData = await postsResponse.json()
      
      const featuredResponse = await fetch('/api/posts?status=published&featured=true&limit=3', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!featuredResponse.ok) {
        throw new Error('Failed to fetch featured posts')
      }
      const featuredData = await featuredResponse.json()
      
      const categoriesResponse = await fetch('/api/categories?includeCounts=true', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
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
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    try {
      // 🐛 FIX: Exclude recipes from search results
      const response = await fetch(`/api/posts?status=published&excludeRecipes=true&search=${encodeURIComponent(searchTerm)}&limit=12`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
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
        {/* ✅ IMPROVED: Better mobile loading skeleton */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Hero skeleton */}
          <section className="bg-gradient-to-br from-background via-background to-muted/20 py-12 sm:py-16 mb-12 sm:mb-16 rounded-lg">
            <div className="text-center mb-8 sm:mb-12 fade-in">
              <div className="skeleton-text h-10 sm:h-12 w-48 sm:w-64 mx-auto mb-3 sm:mb-4"></div>
              <div className="skeleton-text h-5 sm:h-6 w-64 sm:w-96 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Main featured skeleton */}
              <div className="lg:col-span-2">
                <div className="skeleton h-64 sm:h-80 w-full rounded-lg animate-shimmer"></div>
              </div>

              {/* Secondary featured skeletons */}
              <div className="space-y-4 sm:space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border">
                    <div className="skeleton-circle w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="skeleton-text w-16 sm:w-20 h-3 sm:h-4"></div>
                      <div className="skeleton-text w-full h-3 sm:h-4"></div>
                      <div className="skeleton-text w-3/4 h-3 sm:h-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Posts grid skeleton */}
            <div className="lg:col-span-3">
              {/* Search skeleton */}
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="skeleton h-11 sm:h-10 flex-1"></div>
                <div className="skeleton h-11 sm:h-10 w-full sm:w-24"></div>
              </div>

              {/* Section header skeleton */}
              <div className="mb-6 sm:mb-8 space-y-2">
                <div className="skeleton-text h-8 sm:h-10 w-40 sm:w-48"></div>
                <div className="skeleton-text h-4 sm:h-5 w-72 sm:w-96"></div>
              </div>

              {/* Posts grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="blog-card border rounded-lg overflow-hidden scale-in">
                    <div className="skeleton h-40 sm:h-48 w-full animate-shimmer"></div>
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="skeleton-text w-20 sm:w-24 h-4 sm:h-5"></div>
                      <div className="skeleton-text w-full h-5 sm:h-6"></div>
                      <div className="skeleton-text w-5/6 h-5 sm:h-6"></div>
                      <div className="skeleton-text w-full h-3 sm:h-4"></div>
                      <div className="skeleton-text w-4/5 h-3 sm:h-4"></div>
                      <div className="flex justify-between mt-3 sm:mt-4">
                        <div className="skeleton-text w-28 sm:w-32 h-3 sm:h-4"></div>
                        <div className="skeleton-text w-32 sm:w-40 h-3 sm:h-4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-6 sm:space-y-8">
              {/* Categories skeleton */}
              <div className="border rounded-lg p-4 sm:p-6">
                <div className="skeleton-text h-5 sm:h-6 w-24 sm:w-32 mb-3 sm:mb-4"></div>
                <div className="skeleton-text h-3 sm:h-4 w-40 sm:w-48 mb-4 sm:mb-6"></div>
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton-text h-7 sm:h-8 w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ✅ IMPROVED: Hero Section with Better Mobile Spacing */}
      {featuredPosts.length > 0 && (
        <section className="bg-gradient-to-br from-background via-background to-muted/20 py-12 sm:py-14 md:py-16 fade-in">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                Featured <span className="title-gradient">Stories</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Discover our most popular and trending articles
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Main featured post */}
              {featuredPosts[0] && (
                <Link href={getPostUrl(featuredPosts[0])} className="lg:col-span-2 block slide-in">
                  <Card className="blog-card h-full overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group">
                    <div className="relative h-56 sm:h-64 lg:h-80">
                      {featuredPosts[0].featuredImageUrl ? (
                        <Image
                          src={featuredPosts[0].featuredImageUrl}
                          alt={featuredPosts[0].featuredImageAlt || featuredPosts[0].title}
                          fill
                          priority={true}
                          sizes="(max-width: 1024px) 100vw, 66vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                        <Badge className="mb-2 text-xs sm:text-sm" style={{ backgroundColor: featuredPosts[0].category?.color }}>
                          {featuredPosts[0].category?.name}
                        </Badge>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 line-clamp-2 group-hover:text-primary-foreground">
                          {featuredPosts[0].title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm opacity-90">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[120px] sm:max-w-none">{featuredPosts[0].author?.name}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="hidden sm:inline">{formatDate(featuredPosts[0].publishedAt)}</span>
                            <span className="sm:hidden">{formatDate(featuredPosts[0].publishedAt).split(',')[0]}</span>
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

              {/* Secondary featured posts with In-Feed Ad */}
              <div className="space-y-4 sm:space-y-6">
                {/* First featured post */}
                {featuredPosts[1] && (
                  <Link href={getPostUrl(featuredPosts[1])} className="block scale-in" style={{ animationDelay: '100ms' }}>
                    <Card className="blog-card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group">
                      <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded">
                          {featuredPosts[1].featuredImageUrl ? (
                            <Image
                              src={featuredPosts[1].featuredImageUrl}
                              alt={featuredPosts[1].featuredImageAlt || featuredPosts[1].title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center rounded">
                              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary/60" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge 
                            size="sm" 
                            className="mb-1.5 sm:mb-2 text-xs" 
                            style={{ backgroundColor: featuredPosts[1].category?.color }}
                          >
                            {featuredPosts[1].category?.name}
                          </Badge>
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-primary transition-colors">
                            {featuredPosts[1].title}
                          </h3>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            <span className="truncate max-w-[100px] sm:max-w-none">{featuredPosts[1].author?.name}</span>
                            <span className="hidden sm:inline">{formatDate(featuredPosts[1].publishedAt)}</span>
                            <span className="sm:hidden">{formatDate(featuredPosts[1].publishedAt).split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}

                {/* ✅ IN-FEED AD - Featured Section */}
                <div className="scale-in" style={{ animationDelay: '200ms' }}>
                  {/* Desktop Ad */}
                  <div className="hidden sm:block">
                    <AdSense 
                      adSlot="2469183021"
                      adFormat="fluid"
                      adLayout="in-article"
                      adStyle={{ display: 'block', minHeight: '100px' }}
                    />
                  </div>
                  {/* Mobile Ad */}
                  <div className="block sm:hidden">
                    <AdSense 
                      adSlot="9146272012"
                      adFormat="fluid"
                      adLayout="in-article"
                      adStyle={{ display: 'block', minHeight: '100px' }}
                    />
                  </div>
                </div>

                {/* Second featured post */}
                {featuredPosts[2] && (
                  <Link href={getPostUrl(featuredPosts[2])} className="block scale-in" style={{ animationDelay: '300ms' }}>
                    <Card className="blog-card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group">
                      <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded">
                          {featuredPosts[2].featuredImageUrl ? (
                            <Image
                              src={featuredPosts[2].featuredImageUrl}
                              alt={featuredPosts[2].featuredImageAlt || featuredPosts[2].title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center rounded">
                              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary/60" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge 
                            size="sm" 
                            className="mb-1.5 sm:mb-2 text-xs" 
                            style={{ backgroundColor: featuredPosts[2].category?.color }}
                          >
                            {featuredPosts[2].category?.name}
                          </Badge>
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-primary transition-colors">
                            {featuredPosts[2].title}
                          </h3>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            <span className="truncate max-w-[100px] sm:max-w-none">{featuredPosts[2].author?.name}</span>
                            <span className="hidden sm:inline">{formatDate(featuredPosts[2].publishedAt)}</span>
                            <span className="sm:hidden">{formatDate(featuredPosts[2].publishedAt).split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ✅ IMPROVED: Main Content Section */}
      <section className="py-12 sm:py-14 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Main Posts Area */}
            <div className="lg:col-span-3">
              {/* ✅ IMPROVED: Search Bar with Better Mobile Layout */}
              <div className="mb-6 sm:mb-8 fade-in">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <Button type="submit" className="h-11 sm:h-10 w-full sm:w-auto">Search</Button>
                  {searchTerm && (
                    <Button type="button" variant="outline" onClick={clearSearch} className="h-11 sm:h-10 w-full sm:w-auto">
                      Clear
                    </Button>
                  )}
                </form>
              </div>

              {/* Section Header */}
              <div className="flex items-center justify-between mb-6 sm:mb-8 fade-in">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    {searchTerm ? 'Search Results' : 'Latest Articles'}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
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
                  <CardContent className="text-center py-10 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      {searchTerm ? 'No articles found' : 'No articles published yet'}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                      {searchTerm 
                        ? 'Try adjusting your search terms or browse our categories.'
                        : 'Check back soon for new content!'
                      }
                    </p>
                    {searchTerm && (
                      <Button onClick={clearSearch} className="w-full sm:w-auto">
                        Browse All Articles
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* ✅ IMPROVED: Better responsive grid with In-Feed Ads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">
                    {posts.map((post, index) => {
                      // Insert ad after 3rd post (index 2) on both desktop and mobile
                      const showAdAfter = index === 2 && posts.length > 3;
                      
                      return (
                        <div key={post._id} className="contents">
                          {/* Blog Post Card */}
                          <Link href={getPostUrl(post)} className="block scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <Card className="blog-card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group h-full">
                              <div className="relative h-40 sm:h-48 overflow-hidden">
                                {post.featuredImageUrl ? (
                                  <Image
                                    src={post.featuredImageUrl}
                                    alt={post.featuredImageAlt || post.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                                    <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                              </div>
                              
                              <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                  <Badge style={{ backgroundColor: post.category?.color }} className="text-xs sm:text-sm">
                                    {post.category?.name}
                                  </Badge>
                                </div>
                                
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                  {post.title}
                                </h3>
                                
                                <p className="text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                                  {post.excerpt}
                                </p>
                                
                                <div className="space-y-2 sm:space-y-3">
                                  {/* Author & Date */}
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                      {post.author?.profilePictureUrl ? (
                                        <Image
                                          src={post.author.profilePictureUrl}
                                          alt={post.author.name}
                                          width={20}
                                          height={20}
                                          className="rounded-full ring-2 ring-transparent group-hover:ring-primary transition-all sm:w-6 sm:h-6"
                                        />
                                      ) : (
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary transition-all flex-shrink-0">
                                          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                                        </div>
                                      )}
                                      <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                                        {post.author?.name}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0">
                                      <Calendar className="h-3 w-3" />
                                      <span className="hidden sm:inline">{formatDate(post.publishedAt)}</span>
                                      <span className="sm:hidden">{formatDate(post.publishedAt).split(',')[0]}</span>
                                    </div>
                                  </div>

                                  {/* Divider */}
                                  <div className="border-t" />

                                  {/* Stats */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3 text-xs">
                                      <span className="flex items-center gap-1 group-hover:text-foreground transition-colors text-muted-foreground">
                                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        {post.readingTime} min
                                      </span>
                                      {post.views > 0 && (
                                        <span className="flex items-center gap-1 group-hover:text-foreground transition-colors text-muted-foreground">
                                          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                          {post.views}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-full bg-red-50 text-red-600 group-hover:bg-red-100 group-hover:scale-105 transition-all">
                                        <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                                        <span className="text-xs font-semibold">{post.likes?.length || 0}</span>
                                      </span>
                                      <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-105 transition-all">
                                        <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        <span className="text-xs font-semibold">{post.comments?.filter(c => c.isApproved).length || 0}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>

                          {/* ✅ IN-FEED AD - After 3rd Post in Latest Articles */}
                          {showAdAfter && (
                            <div className="scale-in" style={{ animationDelay: `${(index + 1) * 50}ms` }}>
                              {/* Desktop Ad */}
                              <div className="hidden sm:block">
                                <AdSense 
                                  adSlot="9582096729"
                                  adFormat="fluid"
                                  adLayout="in-article"
                                  adStyle={{ display: 'block', minHeight: '250px' }}
                                />
                              </div>
                              {/* Mobile Ad */}
                              <div className="block sm:hidden">
                                <AdSense 
                                  adSlot="3893945332"
                                  adFormat="fluid"
                                  adLayout="in-article"
                                  adStyle={{ display: 'block', minHeight: '250px' }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* ✅ IMPROVED: Pagination with Better Mobile Layout */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 fade-in">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination.hasPrev}
                        className="w-full sm:w-auto h-11 sm:h-10"
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
                        className="w-full sm:w-auto h-11 sm:h-10"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ✅ IMPROVED: Sidebar with Better Mobile Layout */}
            <div className="space-y-6 sm:space-y-8">
              {/* Categories */}
              {categories.length > 0 && (
                <Card className="fade-in">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      Categories
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Browse articles by topic
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-2">
                      {categories.slice(0, 8).map((category) => (
                        <Link
                          key={category._id}
                          href={`/category/${category.slug}`}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group min-h-[44px]"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-transform group-hover:scale-125"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors">{category.name}</span>
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
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Stay Updated</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Get the latest articles delivered to your inbox
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <form className="space-y-3 sm:space-y-4">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                    <Button className="w-full h-11 sm:h-10">
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
