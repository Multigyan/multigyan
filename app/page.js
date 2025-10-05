"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, PenTool, ArrowRight, TrendingUp, Sparkles } from "lucide-react"
import PostCard from "@/components/blog/PostCard"

export default function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [latestPosts, setLatestPosts] = useState([])
  const [topCategories, setTopCategories] = useState([])
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
      // Fetch featured posts
      try {
        const featuredResponse = await fetch('/api/posts?status=published&featured=true&limit=3')
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json()
          setFeaturedPosts(featuredData.posts || [])
        }
      } catch (error) {
        console.error('Error fetching featured posts:', error)
      }
      
      // Fetch latest posts
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
      
      // Fetch top 8 categories with actual post counts
      try {
        const categoriesResponse = await fetch('/api/categories/top?limit=8')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setTopCategories(categoriesData.categories || [])
          setStats(prev => ({
            ...prev,
            totalCategories: categoriesData.total || 0
          }))
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }

      // Fetch authors count
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
        <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-5xl mx-auto animate-pulse">
              <div className="h-6 bg-muted rounded w-64 mx-auto mb-8"></div>
              <div className="h-16 bg-muted rounded w-full mb-6"></div>
              <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-12"></div>
              <div className="flex gap-4 justify-center mb-16">
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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background via-primary/5 to-background">
        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Explore Knowledge, Share Ideas</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              Discover Insights.{" "}
              <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60">
                Multiply Knowledge.
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              Join our community of expert writers and curious readers. 
              Explore articles across technology, business, lifestyle, and more.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-450">
              <Button size="lg" className="text-lg px-8 py-7 shadow-2xl hover:shadow-xl transition-all hover:scale-105" asChild>
                <Link href="/blog">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Articles
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-7 shadow-lg hover:shadow-xl transition-all hover:scale-105" asChild>
                <Link href="/register">
                  <PenTool className="mr-2 h-5 w-5" />
                  Start Writing
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-in fade-in duration-700 delay-600">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-2">
                  {stats.totalPosts > 0 ? `${stats.totalPosts}+` : '0'}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-2">
                  {stats.totalCategories > 0 ? `${stats.totalCategories}+` : '0'}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-2">
                  {stats.totalAuthors > 0 ? `${stats.totalAuthors}+` : '0'}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">Authors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories Section */}
      {topCategories.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Popular</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Explore by <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Category</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover content organized by topics that interest you
              </p>
            </div>

            {/* Top 8 Categories Grid - 2 rows x 4 columns */}
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

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Featured</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Editor&#39;s <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Picks</span>
                </h2>
                <p className="text-muted-foreground">
                  Hand-picked articles our editors think you&#39;ll love
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <div key={post._id} className="animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <PostCard post={post} featured={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/30">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.slice(0, 6).map((post, index) => (
                <div key={post._id} className="animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>

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

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
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
