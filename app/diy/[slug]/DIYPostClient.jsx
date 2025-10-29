"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Heart, 
  MessageCircle,
  ArrowLeft,
  Wrench,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Share2,
  Lightbulb,
  Timer,
  Package,
  Hammer,
  ExternalLink,
  ShoppingCart
} from "lucide-react"
import { formatDate } from "@/lib/helpers"
import { toast } from "sonner"
import CommentSection from "@/components/comments/CommentSection"
import { PostLikeButton } from "@/components/interactions/LikeButton"
import InteractiveCheckList from "@/components/blog/InteractiveCheckList"

export default function DIYPostClient({ post }) {
  const { data: session } = useSession()
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Helper function to get difficulty badge styling
  const getDifficultyBadge = (difficulty) => {
    const styles = {
      easy: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      hard: 'bg-red-100 text-red-800 border-red-300'
    }
    const icons = {
      easy: '🟢',
      medium: '🟡',
      hard: '🔴'
    }
    const labels = {
      easy: 'Easy - Beginner Friendly',
      medium: 'Medium - Some Experience Needed',
      hard: 'Hard - Advanced Skills Required'
    }
    return {
      style: styles[difficulty] || styles.medium,
      icon: icons[difficulty] || icons.medium,
      label: labels[difficulty] || 'Medium'
    }
  }

  useEffect(() => {
    if (post) {
      fetchRelatedPosts()
      setLoading(false)
    }
  }, [post])

  const fetchRelatedPosts = async () => {
    try {
      const response = await fetch(`/api/posts?status=published&limit=3&tags=diy,DIY`)
      const data = await response.json()
      
      if (response.ok) {
        const filtered = data.posts?.filter(p => p._id !== post._id) || []
        setRelatedPosts(filtered.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching related DIY posts:', error)
    }
  }

  const handleShare = async (platform) => {
    const url = window.location.href
    const title = post.title

    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          toast.success('Link copied!')
          return
        } catch (error) {
          toast.error('Failed to copy')
          return
        }
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/diy" className="hover:text-orange-600 font-semibold">DIY</Link>
              <span>/</span>
              <span className="text-foreground truncate">{post.title}</span>
            </nav>

            {/* DIY Badge */}
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
                🎨 DIY Tutorial
              </Badge>
              {post.isFeatured && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Title Section */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-gray-700 leading-relaxed mb-6 border-l-4 border-orange-500 pl-4">
                  {post.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {post.author?.profilePictureUrl ? (
                    <Image
                      src={post.author.profilePictureUrl}
                      alt={post.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                  )}
                  <span className="font-medium text-foreground">
                    <Link href={`/author/${post.author?.username}`} className="hover:text-orange-600">
                      {post.author?.name}
                    </Link>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>{post.readingTime} min</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-orange-600" />
                  <span>{post.views} views</span>
                </div>
              </div>
            </header>

            {/* Share Buttons */}
            <div className="flex items-center gap-2 mb-6 flex-wrap p-4 bg-orange-50 rounded-lg">
              <Wrench className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-semibold text-orange-900">Share this DIY:</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('twitter')}
                className="hover:bg-orange-100 hover:border-orange-500"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('facebook')}
                className="hover:bg-orange-100 hover:border-orange-500"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('linkedin')}
                className="hover:bg-orange-100 hover:border-orange-500"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('whatsapp')}
                className="hover:bg-orange-100 hover:border-orange-500"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('copy')}
                className="hover:bg-orange-100 hover:border-orange-500"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Featured Image */}
            {post.featuredImageUrl && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={post.featuredImageUrl}
                  alt={post.featuredImageAlt || post.title}
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
            )}

            {/* ✨ DIY PROJECT DETAILS (PHASE 2 FIELDS) */}
            {(post.diyDifficulty || post.diyEstimatedTime || (post.diyMaterials && post.diyMaterials.length > 0) || (post.diyTools && post.diyTools.length > 0) || (post.affiliateLinks && post.affiliateLinks.length > 0)) && (
              <div className="mb-8 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Wrench className="h-6 w-6 text-orange-600" />
                  Project Details
                </h2>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Difficulty Level */}
                  {post.diyDifficulty && (
                    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <Timer className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Difficulty</p>
                            <Badge className={`mt-1 ${getDifficultyBadge(post.diyDifficulty).style}`}>
                              {getDifficultyBadge(post.diyDifficulty).icon} {getDifficultyBadge(post.diyDifficulty).label}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Estimated Time */}
                  {post.diyEstimatedTime && (
                    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Estimated Time</p>
                            <p className="font-semibold text-lg">{post.diyEstimatedTime}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Materials and Tools */}
                {((post.diyMaterials && post.diyMaterials.length > 0) || (post.diyTools && post.diyTools.length > 0)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Materials List */}
                    {post.diyMaterials && post.diyMaterials.length > 0 && (
                      <InteractiveCheckList
                        title="Materials Needed"
                        items={post.diyMaterials}
                        icon={Package}
                        storageKey={`diy-materials-${post._id}`}
                        className="border-orange-200"
                      />
                    )}

                    {/* Tools List */}
                    {post.diyTools && post.diyTools.length > 0 && (
                      <InteractiveCheckList
                        title="Tools Required"
                        items={post.diyTools}
                        icon={Hammer}
                        storageKey={`diy-tools-${post._id}`}
                        className="border-orange-200"
                      />
                    )}
                  </div>
                )}

                {/* Affiliate Links */}
                {post.affiliateLinks && post.affiliateLinks.length > 0 && (
                  <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-orange-600" />
                        Recommended Products
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        These are products the author recommends for this project
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {post.affiliateLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="block p-4 rounded-lg border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-orange-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                                {link.name}
                                <ExternalLink className="h-4 w-4" />
                              </h4>
                              {link.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {link.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* DIY Content */}
            <div className="blog-content mb-12 p-6 bg-white rounded-xl shadow-sm">
              <div 
                className="prose prose-orange max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Actions */}
            <div className="flex items-center gap-4 mb-8">
              <PostLikeButton
                targetId={post._id}
                initialLikes={post.likes || []}
                initialIsLiked={session?.user?.id && post.likes?.includes(session.user.id)}
                size="md"
                animated={true}
              />

              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments?.filter(c => c.isApproved).length || 0} Comments</span>
              </Button>
            </div>

            {/* Comments Section */}
            <section className="mb-12">
              <CommentSection 
                postId={post._id} 
                allowComments={post.allowComments}
                showStats={true}
              />
            </section>

            <Separator className="my-8" />

            {/* Author Bio */}
            <Card className="mb-12 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {post.author?.profilePictureUrl ? (
                      <Image
                        src={post.author.profilePictureUrl}
                        alt={post.author.name}
                        width={80}
                        height={80}
                        className="rounded-full ring-4 ring-orange-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center ring-4 ring-orange-300">
                        <User className="h-10 w-10 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      <Link href={`/author/${post.author?.username}`} className="hover:text-orange-600 transition-colors">
                        {post.author?.name}
                      </Link>
                    </h3>
                    <p className="text-gray-700 mb-3">
                      {post.author?.bio || 'Creative DIY enthusiast sharing amazing projects!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related DIY Posts */}
            {relatedPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-orange-600" />
                  More DIY Tutorials
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get inspired with these creative projects
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost._id} href={`/diy/${relatedPost.slug}`}>
                      <Card className="hover:shadow-xl transition-all cursor-pointer group h-full overflow-hidden">
                        <div className="relative h-40 overflow-hidden">
                          {relatedPost.featuredImageUrl ? (
                            <Image
                              src={relatedPost.featuredImageUrl}
                              alt={relatedPost.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                              <Wrench className="h-8 w-8 text-orange-600" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                            {relatedPost.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(relatedPost.publishedAt)}</span>
                            <span>•</span>
                            <span>{relatedPost.readingTime} min</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back Button */}
            <div className="text-center">
              <Button 
                variant="outline" 
                asChild 
                className="hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
              >
                <Link href="/diy">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to DIY Tutorials
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
