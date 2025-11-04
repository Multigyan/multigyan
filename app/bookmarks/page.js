"use client"

/**
 * 🔖 BOOKMARKS PAGE
 * 
 * This page displays all posts that the user has bookmarked.
 * 
 * Features:
 * 1. Grid display of bookmarked posts
 * 2. Filter and sort bookmarks
 * 3. Remove bookmark option
 * 4. Empty state for no bookmarks
 * 5. Requires authentication
 * 
 * URL: /bookmarks
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, BookmarkX, Calendar, User, Eye, Wrench, ChefHat, BookOpen, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import FilterSort from '@/components/posts/FilterSort'
import { useToast } from '@/hooks/use-toast'

export default function BookmarksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  // State
  const [bookmarks, setBookmarks] = useState([])
  const [filteredBookmarks, setFilteredBookmarks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)
  
  // ========================================
  // AUTHENTICATION CHECK
  // ========================================
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to view your bookmarks',
        variant: 'destructive'
      })
      router.push('/login')
    }
  }, [status, router])
  
  // ========================================
  // FETCH BOOKMARKS
  // ========================================
  
  useEffect(() => {
    if (session) {
      fetchBookmarks()
    }
  }, [session])
  
  const fetchBookmarks = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/users/bookmarks')
      const data = await response.json()
      
      if (data.success) {
        setBookmarks(data.posts)
        setFilteredBookmarks(data.posts)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookmarks',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // ========================================
  // REMOVE BOOKMARK
  // ========================================
  
  const handleRemoveBookmark = async (postId) => {
    try {
      setRemovingId(postId)
      
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Remove from local state
        setBookmarks(prev => prev.filter(post => post._id !== postId))
        setFilteredBookmarks(prev => prev.filter(post => post._id !== postId))
        
        toast({
          title: 'Bookmark removed',
          description: 'Post removed from your bookmarks'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark',
        variant: 'destructive'
      })
    } finally {
      setRemovingId(null)
    }
  }
  
  // ========================================
  // HANDLE FILTERING
  // ========================================
  
  const handleFilter = (filters) => {
    let result = [...bookmarks]
    
    // Filter by content type (DIY/Recipe)
    if (filters.difficulty.length > 0) {
      result = result.filter(post => 
        post.contentType === 'diy' && post.diyDifficulty && filters.difficulty.includes(post.diyDifficulty)
      )
    }
    
    if (filters.cuisine.length > 0) {
      result = result.filter(post => 
        post.contentType === 'recipe' && post.recipeCuisine && filters.cuisine.includes(post.recipeCuisine)
      )
    }
    
    if (filters.rating) {
      const minRating = parseFloat(filters.rating)
      result = result.filter(post => 
        post.averageRating && post.averageRating >= minRating
      )
    }
    
    setFilteredBookmarks(result)
  }
  
  // ========================================
  // HANDLE SORTING
  // ========================================
  
  const handleSort = (sortBy) => {
    let sorted = [...filteredBookmarks]
    
    switch (sortBy) {
      case 'latest':
        sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        break
      case 'popular':
        sorted.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        break
      case 'topRated':
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        break
      case 'mostViewed':
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
    }
    
    setFilteredBookmarks(sorted)
  }
  
  // ========================================
  // GET CONTENT TYPE ICON & COLOR
  // ========================================
  
  const getContentTypeInfo = (contentType) => {
    switch (contentType) {
      case 'diy':
        return {
          icon: Wrench,
          color: 'text-orange-600',
          bg: 'bg-orange-100',
          label: 'DIY'
        }
      case 'recipe':
        return {
          icon: ChefHat,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Recipe'
        }
      default:
        return {
          icon: BookOpen,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          label: 'Blog'
        }
    }
  }
  
  // ========================================
  // LOADING STATE
  // ========================================
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // ========================================
  // MAIN RENDER
  // ========================================
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <Bookmark className="h-10 w-10" />
            My Bookmarks
          </h1>
          <p className="text-xl text-yellow-50 max-w-2xl">
            Your saved posts for later reading
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {bookmarks.length === 0 ? (
          // Empty State
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No bookmarks yet</h2>
              <p className="text-muted-foreground mb-6">
                Start bookmarking posts to save them for later!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/blog">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Posts
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/diy">
                    <Wrench className="mr-2 h-4 w-4" />
                    DIY Tutorials
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/recipe">
                    <ChefHat className="mr-2 h-4 w-4" />
                    Recipes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filter & Sort */}
            <FilterSort
              contentType="blog"
              onFilterChange={handleFilter}
              onSortChange={handleSort}
            />
            
            {/* Results Count */}
            <div className="mb-8">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-yellow-600">{filteredBookmarks.length}</span> of <span className="font-semibold">{bookmarks.length}</span> bookmark{bookmarks.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Bookmarks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map((post) => {
                const typeInfo = getContentTypeInfo(post.contentType)
                const TypeIcon = typeInfo.icon
                
                return (
                  <Card key={post._id} className="overflow-hidden hover:shadow-xl transition-all">
                    {/* Featured Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.featuredImageUrl || '/fallback.webp'}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                      
                      {/* Content Type Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${typeInfo.bg} ${typeInfo.color} border-none`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                      </div>
                      
                      {/* Remove Bookmark Button */}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-4 right-4"
                        onClick={() => handleRemoveBookmark(post._id)}
                        disabled={removingId === post._id}
                      >
                        <BookmarkX className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Content */}
                    <CardContent className="p-6">
                      <Link
                        href={`/${post.contentType === 'diy' ? 'diy' : post.contentType === 'recipe' ? 'recipe' : 'blog'}/${post.slug}`}
                        className="group"
                      >
                        <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition line-clamp-2">
                          {post.title}
                        </h2>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                          {post.excerpt}
                        </p>
                      </Link>
                      
                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
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
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <span className="truncate max-w-[120px]">
                            {post.author?.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {post.likes && post.likes.length > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <Heart className="w-4 h-4 fill-current" />
                              {post.likes.length}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
