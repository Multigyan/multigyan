"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, PenTool, ArrowRight, TrendingUp, Sparkles, RefreshCw, AlertCircle } from "lucide-react"
import PostCard from "@/components/blog/PostCard"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/helpers"
import { Calendar, Clock, Eye, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalAuthors: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState({
    posts: true,
    categories: true,
    authors: true
  })
  const [errors, setErrors] = useState({
    posts: null,
    categories: null,
    authors: null
  })

  // Fetch latest posts with error handling
  const fetchLatestPosts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, posts: true }))
      setErrors(prev => ({ ...prev, posts: null }))

      const response = await fetch('/api/posts?status=published&limit=7')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`)
      }

      const data = await response.json()
      
      setLatestPosts(data.posts || [])
      setStats(prev => ({
        ...prev,
        totalPosts: data.pagination?.total || 0
      }))
    } catch (error) {
      console.error('Error fetching latest posts:', error)
      setErrors(prev => ({ 
        ...prev, 
        posts: 'Failed to load latest articles. Please try again.' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, posts: false }))
    }
  }, [])

  // Fetch top categories with error handling
  const fetchTopCategories = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }))
      setErrors(prev => ({ ...prev, categories: null }))

      const response = await fetch('/api/categories/top?limit=8')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`)
      }

      const data = await response.json()
      
      setTopCategories(data.categories || [])
      setStats(prev => ({
        ...prev,
        totalCategories: data.total || 0
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      setErrors(prev => ({ 
        ...prev, 
        categories: 'Failed to load categories. Please try again.' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, categories: false }))
    }
  }, [])

  // Fetch authors count with error handling
  const fetchAuthorsCount = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, authors: true }))
      setErrors(prev => ({ ...prev, authors: null }))

      const response = await fetch('/api/users/authors')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch authors: ${response.status}`)
      }

      const data = await response.json()
      
      setStats(prev => ({
        ...prev,
        totalAuthors: data.total || 0
      }))
    } catch (error) {
      console.error('Error fetching authors:', error)
      setErrors(prev => ({ 
        ...prev, 
        authors: 'Failed to load author count.' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, authors: false }))
    }
  }, [])

  const fetchHomeData = useCallback(async () => {
    await Promise.all([
      fetchLatestPosts(),
      fetchTopCategories(),
      fetchAuthorsCount()
    ])
  }, [fetchLatestPosts, fetchTopCategories, fetchAuthorsCount])

  useEffect(() => {
    fetchHomeData()
  }, [fetchHomeData])

  // Refresh all data
  const handleRefresh = () => {
    fetchHomeData()
  }

  const featuredPost = latestPosts[0]
  const remainingPosts = latestPosts.slice(1, 7)

  // Check if all data is still loading
  const isInitialLoading = loading.posts && loading.categories && loading.authors

  if (isInitialLoading) {
    return (
      <div className="min-h-screen">
        <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-5xl mx-auto animate-pulse">
              <div className="h-6 bg-muted rounded w-64 mx-auto mb-8"></div>
              <div className="h-16 bg-muted rounded w-full mb-6"></div>
              <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-12"></div>
              <div className="flex gap-4 justify-center">
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
      {/* Rest of the component stays the same */}
      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Explore Knowledge, Share Ideas</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                Discover Insights.{" "}
                <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60">
                  Multiply Knowledge.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                Join our community of expert writers and curious readers. 
                Explore articles across technology, business, lifestyle, and more.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-450">
                <Button size="lg" className="text-lg px-8 py-6 shadow-2xl hover:shadow-xl transition-all hover:scale-105" asChild>
                  <Link href="/blog">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Explore Articles
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105" asChild>
                  <Link href="/register">
                    <PenTool className="mr-2 h-5 w-5" />
                    Start Writing
                  </Link>
                </Button>
              </div>
            </div>

            {errors.posts && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{errors.posts}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchLatestPosts}
                    disabled={loading.posts}
                  >
                    {loading.posts ? "Loading..." : "Retry"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </section>

      {/* Add the rest of your sections here - they remain unchanged */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
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

            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading.posts || loading.categories || loading.authors}
                className="text-muted-foreground hover:text-primary"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${(loading.posts || loading.categories || loading.authors) ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>
            </div>

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
