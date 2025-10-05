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
  TrendingUp,
  Filter
} from "lucide-react"
import { formatDate } from "@/lib/helpers"

export default function CategoryPage({ params }) {
  // ✅ FIX: Unwrap params Promise using React.use() (Next.js 15+)
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
      
      // Fetch all categories to find the current one - with real counts
      const categoriesResponse = await fetch('/api/categories?includeCounts=true')
      const categoriesData = await categoriesResponse.json()
      
      if (!categoriesResponse.ok) {
        notFound()
        return
      }
      
      const categories = categoriesData.categories || []
      setAllCategories(categories)
      
      // Find current category by slug
      const currentCategory = categories.find(cat => cat.slug === categorySlug)
      if (!currentCategory) {
        notFound()
        return
      }
      
      setCategory(currentCategory)
      
      // Fetch posts for this category
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
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-muted rounded w-1/2 mb-8"></div>
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

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <Badge 
              size="lg" 
              className="text-sm px-4 py-2"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {category.name} <span className="title-gradient">Articles</span>
          </h1>
          
          {category.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {category.postCount} articles
            </span>
          </div>
        </div>

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
                    placeholder={`Search in ${category.name}...`}
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
                  {searchTerm ? 'Search Results' : 'All Articles'}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {searchTerm 
                    ? `Found ${pagination?.total || 0} articles for "${searchTerm}" in ${category.name}`
                    : `${pagination?.total || 0} articles in ${category.name}`
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
                    {searchTerm ? 'No articles found' : 'No articles in this category yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search terms or browse other categories.'
                      : 'Check back soon for new content in this category!'
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
            {/* Other Categories */}
            {allCategories.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Other Categories
                  </CardTitle>
                  <CardDescription>
                    Explore more topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allCategories
                      .filter(cat => cat._id !== category._id)
                      .slice(0, 8)
                      .map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/category/${cat.slug}`}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-sm font-medium">{cat.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {cat.postCount}
                          </Badge>
                        </Link>
                      ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/blog">
                        View All Categories
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back to Blog */}
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Explore More</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover articles from all categories
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
  )
}