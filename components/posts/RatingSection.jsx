"use client"

/**
 * ⭐ RATING SECTION COMPONENT
 * 
 * This component handles all rating functionality for posts:
 * 1. Display average rating and total ratings
 * 2. Allow users to submit ratings (1-5 stars)
 * 3. Show all user reviews
 * 4. Allow users to mark reviews as "helpful"
 * 
 * Used in: DIY and Recipe post detail pages
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

export default function RatingSection({ postId }) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const { data: session } = useSession() // Get current user info
  const { toast } = useToast() // For showing notifications
  
  // Rating data from server
  const [ratings, setRatings] = useState([]) // All ratings
  const [averageRating, setAverageRating] = useState(0) // Average rating
  const [totalRatings, setTotalRatings] = useState(0) // Total count
  
  // User's rating input
  const [userRating, setUserRating] = useState(0) // Stars clicked (0-5)
  const [hoverRating, setHoverRating] = useState(0) // Stars hovered (0-5)
  const [userReview, setUserReview] = useState('') // Review text
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false) // Submitting rating
  const [isLoading, setIsLoading] = useState(true) // Loading ratings
  
  // Check if user already rated
  const [hasRated, setHasRated] = useState(false)
  const [userExistingRating, setUserExistingRating] = useState(null)
  
  // ========================================
  // FETCH RATINGS ON COMPONENT LOAD
  // ========================================
  
  useEffect(() => {
    fetchRatings()
  }, [postId])
  
  /**
   * Fetch all ratings for this post from the API
   */
  const fetchRatings = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/posts/${postId}/ratings`)
      const data = await response.json()
      
      if (data.success) {
        setRatings(data.ratings)
        setAverageRating(data.averageRating)
        setTotalRatings(data.totalRatings)
        
        // Check if current user already rated
        if (session) {
          const userRating = data.ratings.find(
            r => r.user._id === session.user.id
          )
          if (userRating) {
            setHasRated(true)
            setUserExistingRating(userRating)
            setUserRating(userRating.rating)
            setUserReview(userRating.review || '')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // ========================================
  // SUBMIT RATING
  // ========================================
  
  /**
   * Submit user's rating to the server
   */
  const handleSubmitRating = async () => {
    // Validate: User must be logged in
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to rate this post',
        variant: 'destructive'
      })
      return
    }
    
    // Validate: Rating must be selected
    if (userRating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating',
        variant: 'destructive'
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/posts/${postId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: userRating,
          review: userReview.trim()
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: hasRated ? 'Rating updated!' : 'Rating submitted!',
          description: 'Thank you for your feedback',
        })
        
        // Refresh ratings to show new rating
        await fetchRatings()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit rating',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // ========================================
  // MARK REVIEW AS HELPFUL
  // ========================================
  
  /**
   * Mark a review as helpful
   */
  const handleMarkHelpful = async (ratingId) => {
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to vote',
        variant: 'destructive'
      })
      return
    }
    
    try {
      const response = await fetch(`/api/posts/${postId}/ratings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ratingId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Thanks for your feedback!',
        })
        
        // Refresh ratings
        await fetchRatings()
      }
    } catch (error) {
      console.error('Error marking helpful:', error)
    }
  }
  
  // ========================================
  // RENDER FUNCTIONS
  // ========================================
  
  /**
   * Render star icons (filled/empty based on rating)
   */
  const renderStars = (rating, size = 20, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = interactive
            ? star <= (hoverRating || userRating)
            : star <= rating
          
          return (
            <Star
              key={star}
              size={size}
              className={`${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300'
              } ${interactive ? 'cursor-pointer transition-colors' : ''}`}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && setUserRating(star)}
            />
          )
        })}
      </div>
    )
  }
  
  // ========================================
  // LOADING STATE
  // ========================================
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }
  
  // ========================================
  // MAIN RENDER
  // ========================================
  
  return (
    <Card className="p-6 space-y-6">
      {/* ========================================
          SECTION 1: AVERAGE RATING SUMMARY
          ======================================== */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Ratings & Reviews</h3>
        
        {totalRatings > 0 ? (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              {renderStars(averageRating, 24)}
              <div className="text-sm text-gray-600 mt-1">
                {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No ratings yet. Be the first to rate!</p>
        )}
      </div>
      
      {/* ========================================
          SECTION 2: USER RATING FORM
          ======================================== */}
      {session && (
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-3">
            {hasRated ? 'Update Your Rating' : 'Rate This Post'}
          </h4>
          
          {/* Star Rating Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Your Rating: {userRating > 0 ? `${userRating} stars` : 'Select stars'}
            </label>
            {renderStars(userRating, 32, true)}
          </div>
          
          {/* Review Text Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Your Review (Optional)
            </label>
            <Textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Share your experience with this post..."
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {userReview.length}/1000 characters
            </div>
          </div>
          
          {/* Submit Button */}
          <Button
            onClick={handleSubmitRating}
            disabled={isSubmitting || userRating === 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Submitting...' : hasRated ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </div>
      )}
      
      {/* ========================================
          SECTION 3: ALL REVIEWS LIST
          ======================================== */}
      {ratings.length > 0 && (
        <div className="border-t pt-6 space-y-6">
          <h4 className="font-semibold">All Reviews ({ratings.length})</h4>
          
          {ratings.map((rating) => (
            <div key={rating.id} className="border-b pb-4 last:border-0">
              {/* User Info */}
              <div className="flex items-start gap-3 mb-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={rating.user.profilePictureUrl} />
                  <AvatarFallback>
                    {rating.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rating.user.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {renderStars(rating.rating, 16)}
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(rating.createdAt), {
                            addSuffix: true
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Review Text */}
                  {rating.review && (
                    <p className="text-gray-700 mt-2">{rating.review}</p>
                  )}
                  
                  {/* Helpful Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleMarkHelpful(rating.id)}
                    disabled={!session}
                  >
                    <ThumbsUp size={16} className="mr-1" />
                    Helpful ({rating.helpfulCount})
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
