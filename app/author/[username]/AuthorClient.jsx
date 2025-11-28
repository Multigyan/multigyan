"use client"

import { use, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import LoginPromptDialog from '@/components/LoginPromptDialog'
import PopularPosts from '@/components/blog/PopularPosts'
import CategoriesWidget from '@/components/blog/CategoriesWidget'
import NewsletterCard from '@/components/blog/NewsletterCard'
import FollowersList from '@/components/author/FollowersList'
import ShareButtons from '@/components/ShareButtons'
import {
  Search,
  Calendar,
  Clock,
  User,
  Eye,
  ArrowLeft,
  BookOpen,
  Edit3,
  Heart,
  UserPlus,
  UserMinus,
  Share2
} from "lucide-react"

export default function AuthorClient({ params }) {
  // ✅ FIX for Next.js 15: Unwrap params Promise using React.use()
  const { username } = use(params)
  const { data: session } = useSession() // ✅ ADD: Get session

  const [author, setAuthor] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  // ✅ ADD: Follow functionality states
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)

  // ✅ FIX: Define fetchData with useCallback BEFORE useEffect
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Build query params
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })

      if (searchTerm) {
        queryParams.append('search', searchTerm)
      }

      // Fetch author and posts
      // The API will handle both username and ID
      const response = await fetch(`/api/author/${username}?${queryParams}`)

      if (!response.ok) {
        notFound()
        return
      }

      const data = await response.json()

      if (data.success) {
        setAuthor(data.author)
        setPosts(data.posts)
        setPagination(data.pagination)
      } else {
        notFound()
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }, [username, currentPage, searchTerm])

  // ✅ FIX: Now fetchData is defined, we can use it in useEffect
  useEffect(() => {
    if (username) {
      fetchData()
    }
  }, [username, fetchData])

  // ✅ ADD: Check follow status when author data loads
  useEffect(() => {
    if (session?.user && author && author._id !== session.user.id) {
      checkFollowStatus()
    }
  }, [session, author])

  // ✅ ADD: Function to check if current user follows this author
  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${author._id}/follow`)
      const data = await response.json()
      setIsFollowing(data.isFollowing)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  // ✅ OPTIMISTIC UI: Function to handle follow/unfollow
  const handleFollow = async () => {
    if (!session) {
      setShowLoginDialog(true)
      return
    }

    // Store previous state for rollback
    const previousFollowState = isFollowing
    const previousFollowersCount = author.stats?.followersCount || 0

    // ✅ OPTIMISTIC UPDATE: Update UI immediately
    setIsFollowing(!isFollowing)
    setAuthor(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        followersCount: previousFollowState
          ? previousFollowersCount - 1
          : previousFollowersCount + 1
      }
    }))

    // Show optimistic feedback
    toast.success(!previousFollowState ? 'Following...' : 'Unfollowing...', {
      duration: 1000
    })

    setFollowLoading(true)
    try {
      const response = await fetch(`/api/users/${author._id}/follow`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        // ✅ Update with actual server data
        setIsFollowing(data.isFollowing)
        setAuthor(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followersCount: data.followersCount
          }
        }))

        // Show final success message
        toast.success(data.message, { duration: 2000 })

        // ✅ ANALYTICS: Track follow action
        if (window.gtag) {
          window.gtag('event', data.isFollowing ? 'follow' : 'unfollow', {
            event_category: 'engagement',
            event_label: author.name,
            author_id: author._id,
            author_name: author.name
          })
        }
      } else {
        // ❌ ROLLBACK: Revert optimistic update on error
        setIsFollowing(previousFollowState)
        setAuthor(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followersCount: previousFollowersCount
          }
        }))
        toast.error(data.error)
      }
    } catch (error) {
      // ❌ ROLLBACK: Revert optimistic update on error
      setIsFollowing(previousFollowState)
      setAuthor(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: previousFollowersCount
        }
      }))
      toast.error('Failed to process request')

      console.error('Follow error:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  // ✅ ADD: Function to share profile
  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `Check out ${author.name}'s articles on Multigyan!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: author.name,
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

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-muted rounded-full"></div>
              <div className="space-y-3 flex-1">
                <div className="h-8 bg-muted rounded w-48"></div>
                <div className="h-4 bg-muted rounded w-64"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-muted rounded-lg"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!author) {
    notFound()
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <>
      {/* ✅ Login Dialog */}
      <LoginPromptDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        authorName={author?.name || 'this author'}
      />

      {/* Followers List Modal */}
      <FollowersList
        authorId={author._id}
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/authors" className="hover:text-primary transition-colors">Authors</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{author.name}</span>
          </nav>

          {/* Author Header */}
          <div className="max-w-6xl mx-auto">
            <Card className="mb-12 border-2 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
              {/* Decorative Background Pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>

              <CardContent className="p-8 md:p-12 relative">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0 relative">
                    {author.profilePictureUrl ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-md opacity-30"></div>
                        <Image
                          src={author.profilePictureUrl}
                          alt={author.name}
                          width={140}
                          height={140}
                          className="rounded-full border-4 border-white dark:border-gray-700 shadow-2xl relative"
                        />
                      </div>
                    ) : (
                      <div className="w-36 h-36 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-700">
                        <User className="h-16 w-16 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Author Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent break-words">
                          {author.name}
                        </h1>

                        {author.username && (
                          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-3 md:mb-4 flex items-center gap-2">
                            <span className="text-blue-600 dark:text-blue-400">@</span>{author.username}
                          </p>
                        )}
                      </div>

                      {/* ✅ ADD: Action Buttons - Only show if not viewing own profile */}
                      {session?.user?.id !== author._id && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                          <Button
                            onClick={handleFollow}
                            disabled={followLoading}
                            variant={isFollowing ? "outline" : "default"}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            {followLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isFollowing ? (
                              <>
                                <UserMinus className="h-4 w-4 mr-2" />
                                Unfollow
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              const url = `${process.env.NEXT_PUBLIC_SITE_URL}/author/${author.username || author._id}`
                              navigator.clipboard.writeText(url)
                              toast.success('Link copied to clipboard!')
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      )}
                    </div>

                    {author.bio && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 p-4 rounded-lg border border-blue-100 dark:border-gray-700 mb-6">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
                          "{author.bio}"
                        </p>
                      </div>
                    )}

                    {/* Author Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                      <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                          {author.stats?.totalPosts || 0}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                          Articles
                        </div>
                      </div>
                      <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500 bg-clip-text text-transparent">
                          {author.stats?.totalViews?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                          Total Views
                        </div>
                      </div>
                      <button
                        onClick={() => setShowFollowersModal(true)}
                        className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/10 dark:from-pink-500/20 dark:to-pink-600/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all hover:scale-105 cursor-pointer w-full"
                      >
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 dark:from-pink-400 dark:to-pink-500 bg-clip-text text-transparent">
                          {author.stats?.followersCount || 0}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                          Followers
                        </div>
                      </button>
                      <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 border border-red-200 dark:border-red-800 hover:shadow-lg transition-shadow">
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 dark:from-red-400 dark:to-red-500 bg-clip-text text-transparent">
                          {author.stats?.totalLikes || 0}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                          Total Likes
                        </div>
                      </div>
                    </div>


                    {/* Role Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800">
                      <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        {author.role === 'admin' ? '✨ Administrator & Author' : '📝 Content Author'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Bar */}
            <div className="mb-8">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="relative flex-1 max-w-2xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <Input
                    type="search"
                    placeholder={`Search in ${author.name}'s articles...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm"
                  />
                </div>
                <Button type="submit" className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">Search</Button>
                {searchTerm && (
                  <Button type="button" variant="outline" onClick={clearSearch} className="h-12 px-6 border-2">
                    Clear
                  </Button>
                )}
              </form>
            </div>


            {/* Results Info */}
            <div className="flex items-center justify-between mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-100 dark:border-blue-800">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                  {searchTerm ? '🔍 Search Results' : `📚 Articles by ${author.name}`}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {searchTerm
                    ? `Found ${pagination?.total || 0} articles for "${searchTerm}"`
                    : `${pagination?.total || 0} published articles`
                  }
                </p>
              </div>
            </div>

            {/* Posts Grid */}
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? 'No articles found' : 'No articles published yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? `No articles by ${author.name} match your search.`
                      : `${author.name} hasn't published any articles yet.`
                    }
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/blog">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Browse All Articles
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 2-Column Layout: Main Content + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Main Content Area - 3 columns */}
                  <div className="lg:col-span-3">
                    {/* Posts Grid - 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {posts.map((post) => (
                        <Card key={post._id} className="blog-card overflow-hidden hover:shadow-lg transition-all">
                          <Link href={`/blog/${post.slug}`}>
                            <div className="relative" style={{ aspectRatio: '16 / 9' }}>
                              {post.featuredImageUrl ? (
                                <Image
                                  src={post.featuredImageUrl}
                                  alt={post.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                                  <BookOpen className="h-12 w-12 text-primary/60" />
                                </div>
                              )}
                            </div>

                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-3">
                                {post.category && (
                                  <Badge style={{ backgroundColor: post.category.color }}>
                                    {post.category.name}
                                  </Badge>
                                )}
                              </div>

                              <h3 className="text-xl font-semibold mb-3 line-clamp-2 hover:text-primary transition-colors">
                                {post.title}
                              </h3>

                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {post.excerpt}
                              </p>

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(post.publishedAt)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {post.readTime} min
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  {post.views > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {post.views}
                                    </span>
                                  )}
                                  {post.likes > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      {post.likes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                      <div className="flex justify-center gap-2 mt-8">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={!pagination.hasPrev}
                        >
                          Previous
                        </Button>

                        <span className="flex items-center px-4 text-sm text-muted-foreground">
                          Page {pagination.current} of {pagination.pages}
                        </span>

                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          disabled={!pagination.hasNext}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Sidebar - 1 column */}
                  <div className="space-y-6">
                    {/* Popular Posts by this Author */}
                    <PopularPosts authorId={author._id} limit={5} />

                    {/* Categories */}
                    <CategoriesWidget limit={8} />

                    {/* Newsletter */}
                    <NewsletterCard />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
