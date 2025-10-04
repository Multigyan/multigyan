"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Edit3,
  Heart
} from "lucide-react"

export default function AuthorPage({ params }) {
  const [author, setAuthor] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    if (params.username) {
      fetchData()
    }
  }, [params.username, currentPage, searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Build query params
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (searchTerm) {
        queryParams.append('search', searchTerm)
      }

      // Fetch author and posts
      // The API will handle both username and ID
      const response = await fetch(`/api/author/${params.username}?${queryParams}`)
      
      if (!response.ok) {
        notFound()
        return
      }

      const data = await response.json()
      
      if (data.success) {
        setAuthor(data.author)
        setPosts(data.posts)
        setPagination(data.pagination)
      } else {
        notFound()
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-muted rounded-full"></div>
              <div className="space-y-3 flex-1">
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

  if (!author) {
    notFound()
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/authors" className="hover:text-foreground">Authors</Link>
          <span>/</span>
          <span className="text-foreground">{author.name}</span>
        </nav>

        {/* Author Header */}
        <div className="max-w-6xl mx-auto">
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {author.profilePictureUrl ? (
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
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {author.name}
                  </h1>
                  
                  {author.username && (
                    <p className="text-muted-foreground mb-4">@{author.username}</p>
                  )}
                  
                  {author.bio && (
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      {author.bio}
                    </p>
                  )}

                  {/* Author Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {author.stats?.totalPosts || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Articles
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {author.stats?.totalViews?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Views
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {author.stats?.totalLikes || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Likes
                      </div>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Edit3 className="h-4 w-4" />
                    <span className="text-sm">
                      {author.role === 'admin' ? 'Administrator & Author' : 'Content Author'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Search in ${author.name}&apos;s articles...`}
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
                {searchTerm ? 'Search Results' : `Articles by ${author.name}`}
              </h2>
              <p className="text-muted-foreground mt-1">
                {searchTerm 
                  ? `Found ${pagination?.total || 0} articles for &quot;${searchTerm}&quot;`
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
                    ? `No articles by ${author.name} match your search.`
                    : `${author.name} hasn&apos;t published any articles yet.`
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <Card key={post._id} className="blog-card overflow-hidden hover:shadow-lg transition-all">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="relative h-48">
                        {post.featuredImage ? (
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
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
                          {post.category && (
                            <Badge style={{ backgroundColor: post.category.color }}>
                              {post.category.name}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-3 line-clamp-2 hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(post.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime} min
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {post.views > 0 && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.views}
                              </span>
                            )}
                            {post.likes > 0 && (
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.likes}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Link>
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
      </div>
    </div>
  )
}
