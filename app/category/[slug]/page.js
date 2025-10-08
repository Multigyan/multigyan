"use client"

import { use, useState, useEffect } from "react"
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
  TrendingUp
} from "lucide-react"
import { formatDate } from "@/lib/helpers"

export default function CategoryPage({ params }) {
  const resolvedParams = use(params)
  const categorySlug = resolvedParams.slug
  
  const [category, setCategory] = useState(null)
  const [posts, setPosts] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    if (categorySlug) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const categoriesResponse = await fetch('/api/categories?includeCounts=true')
      const categoriesData = await categoriesResponse.json()
      
      if (!categoriesResponse.ok) {
        notFound()
        return
      }
      
      const categories = categoriesData.categories || []
      setAllCategories(categories)
      
      const currentCategory = categories.find(cat => cat.slug === categorySlug)
      if (!currentCategory) {
        notFound()
        return
      }
      
      setCategory(currentCategory)
      
      const params_obj = new URLSearchParams({
        status: 'published',
        category: currentCategory._id,
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (searchTerm) {
        params_obj.append('search', searchTerm)
      }
      
      const postsResponse = await fetch(`/api/posts?${params_obj}`)
      const postsData = await postsResponse.json()
      
      if (postsResponse.ok) {
        setPosts(postsData.posts || [])
        setPagination(postsData.pagination)
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
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-muted rounded w-1/4 mb-3 sm:mb-4"></div>
            <div className="h-10 sm:h-12 bg-muted rounded w-1/2 mb-6 sm:mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3 sm:space-y-4">
                  <div className="h-40 sm:h-48 bg-muted rounded-lg"></div>
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb - Mobile optimized */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-thin">
          <Link href="/" className="hover:text-foreground whitespace-nowrap">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground whitespace-nowrap">Blog</Link>
          <span>/</span>
          <span className="text-foreground truncate">{category.name}</span>
        </nav>

        {/* Header - Mobile optimized */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <Badge 
              size="lg" 
              className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </Badge>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
            {category.name} <span className="title-gradient">Articles</span>
          </h1>
          
          {category.description && (
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-3 sm:gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">{category.postCount} articles</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar - Mobile optimized */}
            <div className="mb-6 sm:mb-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Search in ${category.name}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 min-h-[44px]"
                  />
                </div>
                <div className="flex gap-2 sm:gap-4">
                  <Button type="submit" className="flex-1 sm:flex-none min-h-[44px]">Search</Button>
                  {searchTerm && (
                    <Button type="button" variant="outline" onClick={clearSearch} className="flex-1 sm:flex-none min-h-[44px]">
                      Clear
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Results Info - Mobile optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {searchTerm ? 'Search Results' : 'All Articles'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {searchTerm 
                    ? `Found ${pagination?.total || 0} for "${searchTerm}"`
                    : `${pagination?.total || 0} articles`
                  }
                </p>
              </div>
            </div>

            {/* Posts Grid - Mobile optimized */}
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 sm:py-12 px-4">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {searchTerm ? 'No articles found' : 'No articles yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'Try different search terms'
                      : 'Check back soon!'
                    }
                  </p>
                  <Button variant="outline" asChild className="min-h-[44px]">
                    <Link href="/blog">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Browse All
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                  {posts.map((post) => (
                    <Card key={post._id} className="blog-card overflow-hidden hover:shadow-lg transition-all">
                      <div className="relative h-40 sm:h-48">
                        {post.featuredImageUrl ? (
                          <Image
                            src={post.featuredImageUrl}
                            alt={post.featuredImageAlt || post.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-primary/60" />
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 line-clamp-2">
                          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                            {post.title}
                          </Link>
                        </h3>
                        
                        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                          <div className="flex items-center gap-2 min-h-[32px]">
                            {post.author?.profilePictureUrl ? (
                              <Image
                                src={post.author.profilePictureUrl}
                                alt={post.author.name}
                                width={20}
                                height={20}
                                className="rounded-full sm:w-6 sm:h-6"
                              />
                            ) : (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                              </div>
                            )}
                            <span className="text-xs sm:text-sm text-muted-foreground truncate">
                              {post.author?.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Calendar className="h-3 w-3" />
                              <span className="hidden sm:inline">{formatDate(post.publishedAt)}</span>
                              <span className="sm:hidden">{formatDate(post.publishedAt).split(',')[0]}</span>
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {post.readingTime} min
                            </span>
                            {post.views > 0 && (
                              <span className="flex items-center gap-1 whitespace-nowrap">
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

                {/* Pagination - Mobile optimized */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrev}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      Previous
                    </Button>
                    
                    <span className="flex items-center px-4 text-xs sm:text-sm text-muted-foreground">
                      Page {pagination.current} of {pagination.pages}
                    </span>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!pagination.hasNext}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Mobile optimized */}
          <div className="space-y-6 lg:space-y-8">
            {allCategories.length > 1 && (
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    Other Categories
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Explore more topics
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 sm:pb-6">
                  <div className="space-y-2">
                    {allCategories
                      .filter(cat => cat._id !== category._id)
                      .slice(0, 8)
                      .map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/category/${cat.slug}`}
                          className="flex items-center justify-between p-2 sm:p-2.5 rounded-md hover:bg-muted transition-colors min-h-[44px]"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-xs sm:text-sm font-medium truncate">{cat.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {cat.postCount}
                          </Badge>
                        </Link>
                      ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full min-h-[44px]" asChild>
                      <Link href="/blog">
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back to Blog - Mobile optimized */}
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">Explore More</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Discover all articles
                </p>
                <Button variant="outline" className="w-full min-h-[44px]" asChild>
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
  )
}