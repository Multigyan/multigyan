"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Shield, Zap, PenTool, Search, ArrowRight, TrendingUp, Award } from "lucide-react"
import PostCard from "@/components/blog/PostCard"

export default function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [latestPosts, setLatestPosts] = useState([])
  const [categories, setCategories] = useState([])
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
      // Fetch featured posts with error handling
      try {
        const featuredResponse = await fetch('/api/posts?status=published&featured=true&limit=3')
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json()
          setFeaturedPosts(featuredData.posts || [])
        }
      } catch (error) {
        console.error('Error fetching featured posts:', error)
      }
      
      // Fetch latest posts with error handling
      try {
        const latestResponse = await fetch('/api/posts?status=published&limit=6')
        if (latestResponse.ok) {
          const latestData = await latestResponse.json()
          setLatestPosts(latestData.posts || [])
          setStats(prev => ({
            ...prev,
            totalPosts: latestData.pagination?.total || 0
          }))
        }
      } catch (error) {
        console.error('Error fetching latest posts:', error)
      }
      
      // Fetch categories with error handling
      try {
        const categoriesResponse = await fetch('/api/categories?limit=8')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories || [])
          setStats(prev => ({
            ...prev,
            totalCategories: categoriesData.total || 0
          }))
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }

      // Fetch authors count with error handling
      try {
        const authorsResponse = await fetch('/api/users/authors')
        if (authorsResponse.ok) {
          const authorsData = await authorsResponse.json()
          setStats(prev => ({
            ...prev,
            totalAuthors: authorsData.total || 0
          }))
        }
      } catch (error) {
        console.error('Error fetching authors:', error)
      }
      
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Hero Skeleton */}
        <section className="relative bg-gradient-to-br from-background via-background to-muted/20 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-5xl mx-auto">
              <div className="skeleton-text h-8 w-96 mx-auto mb-6 animate-shimmer"></div>
              <div className="skeleton-text h-16 w-full max-w-3xl mx-auto mb-4 animate-shimmer"></div>
              <div className="skeleton-text h-6 w-full max-w-2xl mx-auto mb-8 animate-shimmer"></div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <div className="skeleton h-14 w-48 mx-auto sm:mx-0"></div>
                <div className="skeleton h-14 w-48 mx-auto sm:mx-0"></div>
              </div>

              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="skeleton-text h-10 w-20 mx-auto mb-1"></div>
                    <div className="skeleton-text h-4 w-16 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts Skeleton */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <div className="skeleton-text h-10 w-64 mb-2"></div>
              <div className="skeleton-text h-5 w-96"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="skeleton h-56 w-full animate-shimmer"></div>
                  <div className="p-6 space-y-3">
                    <div className="skeleton-text w-24 h-5"></div>
                    <div className="skeleton-text w-full h-6"></div>
                    <div className="skeleton-text w-5/6 h-6"></div>
                    <div className="skeleton-text w-full h-4"></div>
                    <div className="skeleton-text w-4/5 h-4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Posts Skeleton */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <div className="skeleton-text h-10 w-64 mb-2"></div>
              <div className="skeleton-text h-5 w-96"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="skeleton h-48 w-full animate-shimmer"></div>
                  <div className="p-6 space-y-3">
                    <div className="skeleton-text w-24 h-5"></div>
                    <div className="skeleton-text w-full h-6"></div>
                    <div className="skeleton-text w-5/6 h-6"></div>
                    <div className="skeleton-text w-full h-4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted/20 py-20 md:py-32 fade-in">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20 pulse-once">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Multi-Author Blogging Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight scale-in">
              Welcome to{" "}
              <span className="title-gradient">Multigyan</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto slide-in">
              Discover insightful articles, expert perspectives, and engaging stories from our community of talented writers. 
              Where knowledge multiplies through collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 fade-in" style={{ animationDelay: '200ms' }}>
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow" asChild>
                <Link href="/blog">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Articles
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow" asChild>
                <Link href="/register">
                  <PenTool className="mr-2 h-5 w-5" />
                  Start Writing
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto fade-in" style={{ animationDelay: '300ms' }}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1 pulse-once">
                  {stats.totalPosts > 0 ? `${stats.totalPosts}+` : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1 pulse-once" style={{ animationDelay: '100ms' }}>
                  {stats.totalCategories > 0 ? `${stats.totalCategories}+` : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1 pulse-once" style={{ animationDelay: '200ms' }}>
                  {stats.totalAuthors > 0 ? `${stats.totalAuthors}+` : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Authors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {!loading && featuredPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/20 fade-in">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3 border border-primary/20">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">FEATURED</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Featured <span className="title-gradient">Stories</span>
                </h2>
                <p className="text-muted-foreground">
                  Hand-picked articles our editors think you&apos;ll love
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <div key={post._id} className="scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <PostCard post={post} featured={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts Section */}
      {!loading && latestPosts.length > 0 && (
        <section className="py-16 md:py-20 fade-in">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3 border border-primary/20">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">LATEST</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Latest <span className="title-gradient">Articles</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.slice(0, 6).map((post, index) => (
                <div key={post._id} className="scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>

            <div className="text-center mt-10 sm:hidden fade-in">
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

      {/* Empty State if no posts */}
      {!loading && latestPosts.length === 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto scale-in">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 pulse-once">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No Articles Yet</h2>
              <p className="text-muted-foreground mb-6">
                Be the first to share your knowledge! Start writing and publish your first article.
              </p>
              <Button asChild>
                <Link href="/register">
                  <PenTool className="mr-2 h-4 w-4" />
                  Start Writing
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {!loading && categories.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/20 fade-in">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Explore by <span className="title-gradient">Category</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover content organized by topics that interest you
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  className="group scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="blog-card text-center h-full hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div
                        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110 pulse-once"
                        style={{ backgroundColor: `${category.color}20`, animationDelay: `${index * 100}ms` }}
                      >
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
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

            <div className="text-center mt-10 fade-in">
              <Button variant="outline" asChild>
                <Link href="/categories">
                  View All Categories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Section - Benefits, not tech stack */}
      <section className="py-16 md:py-20 fade-in">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="title-gradient">Multigyan</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a thriving community of readers and writers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                title: "Diverse Perspectives",
                description: "Read from multiple authors with unique viewpoints and expertise across various topics and industries.",
                gradient: "from-primary to-primary/60"
              },
              {
                icon: Shield,
                title: "Quality Content",
                description: "Every article goes through our review process to ensure high-quality, valuable content for our readers.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: Search,
                title: "Easy Discovery",
                description: "Find exactly what you're looking for with organized categories, tags, and powerful search functionality.",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: PenTool,
                title: "Share Your Voice",
                description: "Become an author and share your knowledge with our growing community of engaged readers.",
                gradient: "from-purple-500 to-purple-600"
              },
              {
                icon: Zap,
                title: "Always Fresh",
                description: "New articles published regularly across all categories, so there's always something new to discover.",
                gradient: "from-orange-500 to-red-600"
              },
              {
                icon: BookOpen,
                title: "Free Access",
                description: "All our content is freely accessible to everyone. No paywalls, no subscriptions required.",
                gradient: "from-pink-500 to-rose-600"
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="blog-card hover:shadow-lg transition-all border scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className={`w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mb-4 pulse-once`} style={{ animationDelay: `${index * 150}ms` }}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed mt-3">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 fade-in">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="title-gradient">Journey</span>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join our community of writers and readers. Share your knowledge, 
              discover new insights, and be part of the conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-shadow" asChild>
                <Link href="/register">
                  <PenTool className="mr-2 h-6 w-6" />
                  Start Writing Today
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-shadow" asChild>
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
