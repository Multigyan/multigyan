"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
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
  ArrowLeft,
  BookOpen,
  Mail,
  MapPin,
  Edit3
} from "lucide-react"
import { formatDate } from "@/lib/helpers"

export default function AuthorPage({ params }) {
  const [author, setAuthor] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [authorStats, setAuthorStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0
  })

  useEffect(() => {
    if (params.id) {
      fetchData()
    }
  }, [params.id, currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch author's published posts
      const params_obj = new URLSearchParams({
        status: 'published',
        author: params.id,
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (searchTerm) {
        params_obj.append('search', searchTerm)
      }
      
      const postsResponse = await fetch(`/api/posts?${params_obj}`)
      const postsData = await postsResponse.json()
      
      if (!postsResponse.ok || !postsData.posts || postsData.posts.length === 0) {
        // If no posts found, try to get author info from any post (including drafts) if it's their own profile
        // For now, we'll show not found if no published posts exist
        if (currentPage === 1 && !searchTerm) {
          notFound()
          return
        }
      }
      
      if (postsResponse.ok && postsData.posts && postsData.posts.length > 0) {
        setPosts(postsData.posts)
        setPagination(postsData.pagination)
        
        // Get author info from the first post
        const authorInfo = postsData.posts[0]?.author
        if (authorInfo && !author) {
          setAuthor(authorInfo)
        }
        
        // Calculate author stats
        const totalViews = postsData.posts.reduce((sum, post) => sum + (post.views || 0), 0)
        const totalLikes = postsData.posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)
        
        setAuthorStats({
          totalPosts: postsData.pagination?.total || postsData.posts.length,
          totalViews,
          totalLikes
        })
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchData()
  }

  const clearSearch = () => {
    setSearchTerm("")
    setCurrentPage(1)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-muted rounded-full"></div>
              <div className="space-y-3">
                <div className="h-8 bg-muted rounded w-48"></div>
                <div className="h-4 bg-muted rounded w-64"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            </div>
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

  if (!author && posts.length === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <span>/</span>
          <span className="text-foreground">Authors</span>
          <span>/</span>
          <span className="text-foreground">{author?.name}</span>
        </nav>

        {/* Author Header */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {author?.profilePictureUrl ? (
                    <Image
                      src={author.profilePictureUrl}
                      alt={author.name}
                      width={120}
                      height={120}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-30 h-30 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {author?.name}
                  </h1>
                  
                  {author?.bio && (
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      {author.bio}
                    </p>
                  )}

                  {/* Author Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {authorStats.totalPosts}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Articles
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {authorStats.totalViews.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Views
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {authorStats.totalLikes}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Likes
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      <span className="text-sm">Content Creator</span>
                    </div>
                    {author?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{author.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author's Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={`Search in ${author?.name}'s articles...`}
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

              {/* Results Info */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">
                    {searchTerm ? 'Search Results' : `Articles by ${author?.name}`}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm 
                      ? `Found ${pagination?.total || 0} articles for "${searchTerm}"`
                      : `${pagination?.total || 0} published articles`
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
                    <p className="text-muted-foreground mb-4">
                      {searchTerm 
                        ? `No articles by ${author?.name} match your search.`
                        : `${author?.name} hasn't published any articles yet.`
                      }
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Browse All Articles
                      </Link>
                    </Button>
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
                            {post.isFeatured && (
                              <Badge variant="secondary">Featured</Badge>
                            )}
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
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(post.publishedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readingTime} min
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {post.views > 0 && (
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {post.views}
                                </span>
                              )}
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
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Author Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Articles Published</span>
                      <span className="font-semibold">{authorStats.totalPosts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Views</span>
                      <span className="font-semibold">{authorStats.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Likes</span>
                      <span className="font-semibold">{authorStats.totalLikes}</span>
                    </div>
                    {authorStats.totalPosts > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Views per Post</span>
                        <span className="font-semibold">
                          {Math.round(authorStats.totalViews / authorStats.totalPosts)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Back to Blog */}
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Explore More</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover articles from other authors
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/blog">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Blog
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}