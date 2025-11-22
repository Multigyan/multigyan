"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import {
  User as UserIcon,
  Mail,
  Globe,
  Twitter,
  Linkedin,
  Calendar,
  Shield,
  PenTool,
  UserPlus,
  UserMinus,
  Share2,
  Eye,
  Heart,
  Clock,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

// ⚡ OPTIMIZATION: Helper function to safely format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Recently'

  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Recently'
    }

    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Recently'
  }
}

// ⚡ OPTIMIZATION: Helper function to format post dates
const formatPostDate = (dateString) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    return ''
  }
}

export default function ProfileClientPage({ initialUser, initialPosts, initialStats }) {
  const { data: session } = useSession()
  const [user, setUser] = useState(initialUser)
  const [posts, setPosts] = useState(initialPosts)
  const [stats, setStats] = useState(initialStats)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)

  // ⚡ OPTIMIZATION: SWR caching for profile data
  const fetcher = (url) => fetch(url).then((res) => res.json())

  const { data: cachedStats, mutate: mutateStats } = useSWR(
    `/api/users/${user._id}/stats`,
    fetcher,
    {
      fallbackData: initialStats,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  // Update stats when cache updates
  useEffect(() => {
    if (cachedStats) {
      setStats(cachedStats)
    }
  }, [cachedStats])

  // ⚡ ANALYTICS: Track profile views (TEMPORARILY DISABLED)
  // useEffect(() => {
  //   const trackProfileView = async () => {
  //     try {
  //       // Use AbortController for timeout
  //       const controller = new AbortController()
  //       const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

  //       fetch('/api/analytics/profile-view', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           profileId: user._id,
  //           username: user.username,
  //           timestamp: new Date().toISOString(),
  //         }),
  //         signal: controller.signal
  //       }).then(() => clearTimeout(timeoutId))
  //         .catch(() => {
  //           // Silently fail - analytics shouldn't break the page
  //           clearTimeout(timeoutId)
  //         })
  //     } catch (error) {
  //       // Silently fail
  //     }
  //   }

  //   // Delay tracking to not block page load
  //   const timer = setTimeout(trackProfileView, 1000)
  //   return () => clearTimeout(timer)
  // }, [user._id, user.username])

  // ⚡ ANALYTICS: Track time on profile
  useEffect(() => {
    const startTime = Date.now()

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      // Only track if user spent more than 5 seconds
      if (timeSpent > 5) {
        fetch('/api/analytics/profile-view/time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: user._id,
            timeSpent
          })
        }).catch(() => { })
      }
    }
  }, [user._id])

  // ⚡ ANALYTICS: Track sections viewed
  useEffect(() => {
    const trackSection = (sectionName) => {
      fetch('/api/analytics/profile-view/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: user._id,
          section: sectionName
        })
      }).catch(() => { })
    }

    // Use Intersection Observer to track section views
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.dataset.section) {
          trackSection(entry.target.dataset.section)
        }
      })
    }, { threshold: 0.5 })

    // Observe all sections
    const sections = document.querySelectorAll('[data-section]')
    sections.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [user._id])

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  // Check if current user is following this profile
  useEffect(() => {
    if (session?.user && user._id !== session.user.id) {
      checkFollowStatus()
    }
  }, [session, user])

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${user._id}/follow`)
      const data = await response.json()
      setIsFollowing(data.isFollowing)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollow = async () => {
    if (!session) {
      toast.error('Please sign in to follow users')
      return
    }

    setFollowLoading(true)
    try {
      const response = await fetch(`/api/users/${user._id}/follow`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setIsFollowing(data.isFollowing)
        setStats(prev => ({
          ...prev,
          followersCount: data.followersCount
        }))
        // ⚡ OPTIMIZATION: Mutate SWR cache
        mutateStats({
          ...stats,
          followersCount: data.followersCount
        }, false)

        // ⚡ ANALYTICS: Track conversion if user followed
        if (data.isFollowing) {
          fetch('/api/analytics/profile-view/conversion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId: user._id })
          }).catch(() => { })
        }

        toast.success(data.message)
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Failed to process request')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `Check out ${user.name}'s profile on Multigyan!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: user.name,
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareUrl)
        }
      }
    } else {
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Profile link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  {user.profilePictureUrl ? (
                    <Image
                      src={user.profilePictureUrl}
                      alt={user.name}
                      width={128}
                      height={128}
                      className="rounded-full object-cover"
                      priority
                    />
                  ) : (
                    <AvatarFallback className="bg-white text-blue-600 text-3xl font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {user.role === 'admin' && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                    <Shield className="h-5 w-5 text-yellow-900" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                <p className="text-blue-100 mb-4">@{user.username}</p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <PenTool className="h-3 w-3 mr-1" />
                        Author
                      </>
                    )}
                  </Badge>

                  {user.emailVerified && (
                    <Badge variant="outline" className="bg-white/20 border-white text-white">
                      ✓ Verified
                    </Badge>
                  )}
                </div>

                {user.bio && (
                  <p className="text-lg text-blue-50 max-w-2xl mb-4">
                    {user.bio}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {session?.user?.id !== user._id && (
                    <Button
                      onClick={handleFollow}
                      disabled={followLoading}
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing ? "bg-white/20 border-white text-white hover:bg-white/30" : ""}
                    >
                      {followLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : isFollowing ? (
                        <UserMinus className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="bg-white/20 border-white text-white hover:bg-white/30"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                  <FileText className="h-5 w-5 text-blue-600" />
                  {stats.totalPosts}
                </div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                  <Eye className="h-5 w-5 text-green-600" />
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Views</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                  <Users className="h-5 w-5 text-purple-600" />
                  {stats.followersCount}
                </div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                  <Heart className="h-5 w-5 text-red-600" />
                  {stats.totalLikes}
                </div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {user.email}
                    </a>
                  </div>
                )}

                {user.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      Website
                    </a>
                  </div>
                )}

                {user.twitterHandle && (
                  <div className="flex items-center gap-3 text-sm">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`https://twitter.com/${user.twitterHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {user.twitterHandle}
                    </a>
                  </div>
                )}

                {user.linkedinUrl && (
                  <div className="flex items-center gap-3 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Member Since */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About {user.name.split(' ')[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                {user.bio ? (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {user.bio}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    This user hasn't added a bio yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Posts Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {posts.length} of {stats.totalPosts} published articles
                </p>
              </CardHeader>
              <CardContent>
                {posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <Link
                        key={post._id}
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-4">
                          {post.featuredImageUrl && (
                            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={post.featuredImageUrl}
                                alt={post.title}
                                width={96}
                                height={96}
                                className="object-cover group-hover:scale-110 transition-transform"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors mb-1">
                              {post.title}
                            </h3>
                            {post.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatPostDate(post.publishedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readingTime} min read
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.likes?.length || 0}
                              </span>
                            </div>
                            {post.category && (
                              <Badge variant="outline" className="mt-2">
                                {post.category.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}

                    {posts.length < stats.totalPosts && (
                      <div className="text-center pt-4">
                        <Button variant="outline" asChild>
                          <Link href={`/author/${user.username}`}>
                            View All Posts
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No posts published yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
