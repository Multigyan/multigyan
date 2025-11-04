"use client"

/**
 * 🔖 BOOKMARK BUTTON COMPONENT
 * 
 * This is a reusable button component that allows users to:
 * 1. Bookmark (save) a post for later
 * 2. Remove a bookmark
 * 3. See bookmark count
 * 4. Get visual feedback (filled/empty icon)
 * 
 * Can be used in: Post cards, detail pages, anywhere you show posts
 * 
 * Usage:
 * <BookmarkButton postId={post._id} initialBookmarked={isBookmarked} initialCount={saveCount} />
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function BookmarkButton({ 
  postId, 
  initialBookmarked = false, 
  initialCount = 0,
  size = "default", // "sm", "default", "lg"
  showCount = true // Show bookmark count next to icon
}) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const { data: session } = useSession() // Get current user
  
  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [bookmarkCount, setBookmarkCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  
  // ========================================
  // FETCH BOOKMARK STATUS
  // ========================================
  
  /**
   * Check if user has bookmarked this post
   * Only runs if user is logged in
   */
  useEffect(() => {
    if (session) {
      checkBookmarkStatus()
    }
  }, [postId, session])
  
  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`)
      const data = await response.json()
      
      if (data.success) {
        setIsBookmarked(data.isBookmarked)
        setBookmarkCount(data.saveCount)
      }
    } catch (error) {
      console.error('Error checking bookmark:', error)
    }
  }
  
  // ========================================
  // TOGGLE BOOKMARK
  // ========================================
  
  /**
   * Toggle bookmark when button is clicked
   */
  const handleToggleBookmark = async () => {
    // Check if user is logged in
    if (!session) {
      toast.error('Please sign in to bookmark posts')
      return
    }
    
    try {
      setIsLoading(true)
      
      // Call API to toggle bookmark
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update UI
        setIsBookmarked(data.isBookmarked)
        setBookmarkCount(data.saveCount)
        
        // Show notification
        toast.success(data.message)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update bookmark')
    } finally {
      setIsLoading(false)
    }
  }
  
  // ========================================
  // SIZE CONFIGURATIONS
  // ========================================
  
  const sizeConfig = {
    sm: {
      icon: 16,
      button: "h-8 px-2"
    },
    default: {
      icon: 20,
      button: "h-10 px-3"
    },
    lg: {
      icon: 24,
      button: "h-12 px-4"
    }
  }
  
  const config = sizeConfig[size]
  
  // ========================================
  // RENDER
  // ========================================
  
  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={`${config.button} transition-all duration-200 ${
        isBookmarked 
          ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
          : 'hover:bg-yellow-50'
      }`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
    >
      {/* Bookmark Icon */}
      <Bookmark
        size={config.icon}
        className={`transition-all ${
          isBookmarked ? 'fill-current' : ''
        } ${isLoading ? 'animate-pulse' : ''}`}
      />
      
      {/* Bookmark Count (optional) */}
      {showCount && bookmarkCount > 0 && (
        <span className="ml-1 font-medium">
          {bookmarkCount}
        </span>
      )}
    </Button>
  )
}

/**
 * ========================================
 * USAGE EXAMPLES
 * ========================================
 * 
 * 1. In a post card:
 * <BookmarkButton postId={post._id} size="sm" />
 * 
 * 2. In a post detail page:
 * <BookmarkButton 
 *   postId={post._id} 
 *   initialBookmarked={post.saves.includes(userId)}
 *   initialCount={post.saves.length}
 * />
 * 
 * 3. Without count:
 * <BookmarkButton postId={post._id} showCount={false} />
 */
