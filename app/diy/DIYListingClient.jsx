"use client"

/**
 * 🎨 DIY LISTING CLIENT COMPONENT
 * 
 * This component handles:
 * 1. Displaying all DIY posts in a grid
 * 2. Filtering posts by difficulty, time, rating
 * 3. Sorting posts by latest, popular, top-rated
 * 4. Client-side interactivity (bookmarks, likes)
 * 
 * Used in: /diy page
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Eye, Wrench, Timer, Package, Heart, Bookmark } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FilterSort from '@/components/posts/FilterSort'

// Helper function for difficulty badge
function getDifficultyBadge(difficulty) {
  const configs = {
    easy: { color: 'bg-green-100 text-green-800 border-green-300', icon: '🟢', label: 'Easy' },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🟡', label: 'Medium' },
    hard: { color: 'bg-red-100 text-red-800 border-red-300', icon: '🔴', label: 'Hard' }
  }
  return configs[difficulty] || configs.medium
}

export default function DIYListingClient({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts)
  const [filteredPosts, setFilteredPosts] = useState(initialPosts)
  const [isLoading, setIsLoading] = useState(false)

  // ========================================
  // HANDLE FILTERING
  // ========================================
  const handleFilter = (filters) => {
    setIsLoading(true)
    
    let result = [...posts]

    // Filter by difficulty
    if (filters.difficulty.length > 0) {
      result = result.filter(post => 
        post.diyDifficulty && filters.difficulty.includes(post.diyDifficulty)
      )
    }

    // Filter by time range
    if (filters.timeRange) {
      const [min, max] = filters.timeRange.split('-').map(t => 
        t.includes('+') ? Infinity : parseInt(t)
      )
      
      result = result.filter(post => {
        if (!post.diyEstimatedTime) return false
        
        // Extract hours from estimated time (e.g., "2-3 hours" -> 2)
        const timeMatch = post.diyEstimatedTime.match(/(\d+)/)
        if (!timeMatch) return false
        
        const hours = parseInt(timeMatch[1])
        const minutes = post.diyEstimatedTime.includes('min') ? hours : hours * 60
        
        return minutes >= min && (max === Infinity || minutes <= max)
      })
    }

    // Filter by minimum rating
    if (filters.rating) {
      const minRating = parseFloat(filters.rating)
      result = result.filter(post => 
        post.averageRating && post.averageRating >= minRating
      )
    }

    setFilteredPosts(result)
    setIsLoading(false)
  }

  // ========================================
  // HANDLE SORTING
  // ========================================
  const handleSort = (sortBy) => {
    setIsLoading(true)
    
    let sorted = [...filteredPosts]

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
      
      default:
        break
    }

    setFilteredPosts(sorted)
    setIsLoading(false)
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="container mx-auto px-4 py-12">
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <p className="text-2xl text-gray-600 mb-4">
            No DIY tutorials available yet 🎨
          </p>
          <p className="text-gray-500 mb-6">
            Check back soon for creative projects and tutorials!
          </p>
          <Link 
            href="/blog"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
          >
            Browse All Posts
          </Link>
        </div>
      ) : (
        <>
          {/* 🔍 NEW: Filter & Sort Component */}
          <FilterSort
            contentType="diy"
            onFilterChange={handleFilter}
            onSortChange={handleSort}
          />

          {/* Results Count */}
          <div className="mb-8 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-orange-600">{filteredPosts.length}</span> of <span className="font-semibold">{posts.length}</span> DIY Tutorial{posts.length !== 1 ? 's' : ''}
            </p>
            <Badge className="bg-orange-100 text-orange-800 border-orange-300">
              <Wrench className="w-3 h-3 mr-1" />
              DIY Collection
            </Badge>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          )}

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => {
              const difficultyBadge = post.diyDifficulty ? getDifficultyBadge(post.diyDifficulty) : null
              
              return (
                <Link
                  key={post._id}
                  href={`/diy/${post.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border-orange-100">
                    {/* Featured Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.featuredImageUrl || '/fallback.webp'}
                        alt={post.featuredImageAlt || post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Difficulty Badge */}
                      {difficultyBadge && (
                        <div className="absolute top-4 left-4">
                          <Badge className={`${difficultyBadge.color} border font-semibold shadow-lg`}>
                            {difficultyBadge.icon} {difficultyBadge.label}
                          </Badge>
                        </div>
                      )}

                      {/* Category Badge */}
                      {post.category && (
                        <div className="absolute top-4 right-4">
                          <Badge 
                            className="text-white border-none shadow-lg"
                            style={{ backgroundColor: post.category.color || '#FF6B35' }}
                          >
                            {post.category.name}
                          </Badge>
                        </div>
                      )}

                      {/* Rating Badge (if exists) */}
                      {post.averageRating > 0 && (
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg">
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            <span className="text-yellow-500">⭐</span>
                            <span>{post.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 flex-1 flex flex-col">
                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-2 flex-1 text-sm">
                        {post.excerpt}
                      </p>

                      {/* DIY Project Info */}
                      {(post.diyEstimatedTime || (post.diyMaterials && post.diyMaterials.length > 0)) && (
                        <div className="mb-4 p-3 bg-orange-50 rounded-lg space-y-2">
                          {post.diyEstimatedTime && (
                            <div className="flex items-center gap-2 text-sm text-orange-800">
                              <Timer className="w-4 h-4" />
                              <span className="font-medium">{post.diyEstimatedTime}</span>
                            </div>
                          )}
                          {post.diyMaterials && post.diyMaterials.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-orange-800">
                              <Package className="w-4 h-4" />
                              <span>{post.diyMaterials.length} materials needed</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-orange-100">
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
                            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-orange-600" />
                            </div>
                          )}
                          <span className="truncate max-w-[120px] font-medium text-gray-700">
                            {post.author?.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Likes */}
                          {post.likes && post.likes.length > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <Heart className="w-4 h-4 fill-current" />
                              {post.likes.length}
                            </span>
                          )}
                          
                          {/* Saves */}
                          {post.saves && post.saves.length > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Bookmark className="w-4 h-4 fill-current" />
                              {post.saves.length}
                            </span>
                          )}
                          
                          {/* Views */}
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-orange-600" />
                            {post.views || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
