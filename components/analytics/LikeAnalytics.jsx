"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, TrendingUp, Users, MessageCircle } from 'lucide-react'

/**
 * Like Analytics Component for Admin Dashboard
 * Shows statistics about likes across posts and comments
 */
export default function LikeAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalLikes: 0,
    postLikes: 0,
    commentLikes: 0,
    topLikedPosts: [],
    recentActivity: [],
    likesThisWeek: 0,
    growthPercentage: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/likes')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching like analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold">{analytics.totalLikes.toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Post Likes</p>
                <p className="text-2xl font-bold">{analytics.postLikes.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comment Likes</p>
                <p className="text-2xl font-bold">{analytics.commentLikes.toLocaleString()}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{analytics.likesThisWeek.toLocaleString()}</p>
                {analytics.growthPercentage !== 0 && (
                  <p className={`text-xs ${analytics.growthPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.growthPercentage > 0 ? '+' : ''}{analytics.growthPercentage.toFixed(1)}% from last week
                  </p>
                )}
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Liked Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Liked Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topLikedPosts.map((post, index) => (
                <div key={post._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-2">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {post.author?.name} • {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Heart className="h-4 w-4 text-red-500" />
                      {post.likeCount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Like Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                  <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name || 'Anonymous'}</span>
                      {' '}liked {activity.type === 'post' ? 'a post' : 'a comment'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.title}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
