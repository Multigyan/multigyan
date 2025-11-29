"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, FolderOpen, User, X } from "lucide-react"
import PostCard from "@/components/blog/PostCard"

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState({ posts: [], categories: [], authors: [] })
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  // Set page title
  useEffect(() => {
    document.title = "Search | Multigyan"
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults({ posts: [], categories: [], authors: [] })
      setTotal(0)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults({ posts: [], categories: [], authors: [] })
    setTotal(0)
    router.push('/search')
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-6 text-center">Search</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles, categories, authors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-24 py-6 text-lg"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-14 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            <Button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              Search
            </Button>
          </form>

          {/* Search Info */}
          {query && !loading && (
            <p className="text-muted-foreground mt-4 text-center">
              {total > 0 ? (
                <>
                  Found <span className="font-semibold text-foreground">{total}</span> result
                  {total !== 1 ? 's' : ''} for &quot;<span className="font-semibold text-foreground">{query}</span>&quot;
                </>
              ) : (
                <>No results found for &quot;<span className="font-semibold">{query}</span>&quot;</>
              )}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Searching...</p>
          </div>
        )}

        {/* Results */}
        {!loading && total > 0 && (
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Posts Results */}
            {results.posts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">
                    Articles ({results.posts.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Categories Results */}
            {results.categories.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">
                    Categories ({results.categories.length})
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/category/${category.slug}`}
                      className="group"
                    >
                      <Card className="blog-card hover:shadow-lg transition-all h-full">
                        <CardContent className="p-4">
                          <div
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          </div>
                          <h3 className="font-semibold text-center mb-1 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          {category.postCount > 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                              {category.postCount} articles
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Authors Results */}
            {results.authors.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">
                    Authors ({results.authors.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.authors.map((author) => (
                    <Link
                      key={author._id}
                      href={`/author/${author._id}`}
                      className="group"
                    >
                      <Card className="blog-card hover:shadow-lg transition-all">
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {author.profilePictureUrl ? (
                                <Image
                                  src={author.profilePictureUrl}
                                  alt={author.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-8 w-8 text-primary" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {author.name}
                              </h3>
                              {author.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {author.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* No Results State */}
        {!loading && query && total === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No results found</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              We couldn&apos;t find anything matching &quot;{query}&quot;. Try different keywords or browse our categories.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={clearSearch} variant="outline">
                Clear Search
              </Button>
              <Button asChild>
                <Link href="/blog">Browse All Articles</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !query && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Start searching</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Enter keywords above to search for articles, categories, and authors.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/blog">Browse Articles</Link>
              </Button>
              <Button asChild>
                <Link href="/categories">View Categories</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
