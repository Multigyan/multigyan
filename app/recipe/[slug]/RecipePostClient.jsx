"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  MessageCircle,
  ArrowLeft,
  ChefHat,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Share2,
  UtensilsCrossed,
  Timer,
  Users,
  CookingPot,
  ExternalLink,
  ShoppingCart,
  Printer,
  CheckCircle2
} from "lucide-react"
import { formatDate } from "@/lib/helpers"
import { toast } from "sonner"
import CommentSection from "@/components/comments/CommentSection"
import { PostLikeButton } from "@/components/interactions/LikeButton"
import InteractiveCheckList from "@/components/blog/InteractiveCheckList"
import PrintRecipeButton from "@/components/blog/PrintRecipeButton"
import BookmarkButton from "@/components/posts/BookmarkButton"
import RatingSection from "@/components/posts/RatingSection"
import IMadeThisSection from "@/components/posts/IMadeThisSection"
import CodeBlockCopyButton from "@/components/blog/CodeBlockCopyButton"
import AdSense from "@/components/AdSense" // ✅ Import AdSense

export default function RecipePostClient({ post }) {
  const { data: session } = useSession()
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // ✨ State to track live comment stats
  const [commentStats, setCommentStats] = useState({
    approved: post.comments?.filter(c => c.isApproved).length || 0,
    totalLikes: 0
  })

  useEffect(() => {
    if (post) {
      fetchRelatedPosts()
      setLoading(false)
    }
  }, [post])

  const fetchRelatedPosts = async () => {
    try {
      // Fetch only recipes from the same author
      const response = await fetch(`/api/posts?status=published&contentType=recipe&author=${post.author?._id}&limit=4`)
      const data = await response.json()
      
      if (response.ok) {
        // Exclude current post and limit to 3
        const filtered = data.posts?.filter(p => p._id !== post._id) || []
        setRelatedPosts(filtered.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching related recipes:', error)
    }
  }

  // ✨ Callback to update comment stats when they change
  const handleCommentStatsUpdate = (newStats) => {
    setCommentStats({
      approved: newStats.approved || 0,
      totalLikes: newStats.totalLikes || 0
    })
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
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white">
      {/* ✨ Add Code Block Copy Buttons */}
      <CodeBlockCopyButton />
      
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/recipe" className="hover:text-green-600 font-semibold">Recipes</Link>
              <span>/</span>
              <span className="text-foreground truncate">{post.title}</span>
            </nav>

            {/* Recipe Badge */}
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none flex items-center gap-1">
                <ChefHat className="w-3 h-3" />
                Recipe
              </Badge>
              {post.isFeatured && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3" />
                  Popular
                </Badge>
              )}
            </div>

            {/* Title Section */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-gray-700 leading-relaxed mb-6 border-l-4 border-green-600 pl-4 bg-green-50/50 py-3">
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
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-green-700" />
                    </div>
                  )}
                  <span className="font-medium text-foreground">
                    <Link href={`/author/${post.author?.username}`} className="hover:text-green-600">
                      {post.author?.name}
                    </Link>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>{post.readingTime} min read</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span>{post.views} views</span>
                </div>
              </div>
            </header>

            {/* Share Buttons */}
            <div className="flex items-center gap-2 mb-6 flex-wrap p-4 bg-green-50 rounded-lg border border-green-200">
              <UtensilsCrossed className="h-5 w-5 text-green-700" />
              <span className="text-sm font-semibold text-green-900">Share this recipe:</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('twitter')}
                className="hover:bg-green-100 hover:border-green-500"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('facebook')}
                className="hover:bg-green-100 hover:border-green-500"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('linkedin')}
                className="hover:bg-green-100 hover:border-green-500"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('whatsapp')}
                className="hover:bg-green-100 hover:border-green-500"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('copy')}
                className="hover:bg-green-100 hover:border-green-500"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Featured Image */}
            {post.featuredImageUrl && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-2xl ring-4 ring-green-100">
                <img
                  src={post.featuredImageUrl}
                  alt={post.featuredImageAlt || post.title}
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
            )}

            {/* ✅ TOP AD - After Featured Image */}
            <div className="my-8">
              <AdSense 
                adSlot="2469893467"
                adFormat="auto"
                adStyle={{ display: 'block', textAlign: 'center' }}
              />
            </div>

            {/* ✨ RECIPE DETAILS (PHASE 2 FIELDS) */}
            {(post.recipePrepTime || post.recipeCookTime || post.recipeServings || (post.recipeIngredients && post.recipeIngredients.length > 0) || post.recipeCuisine || (post.recipeDiet && post.recipeDiet.length > 0) || (post.affiliateLinks && post.affiliateLinks.length > 0)) && (
              <div className="mb-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ChefHat className="h-6 w-6 text-green-700" />
                    Recipe Information
                  </h2>
                  <PrintRecipeButton className="hidden md:flex" />
                </div>

                {/* Quick Info Grid */}
                {(post.recipePrepTime || post.recipeCookTime || post.recipeServings) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Prep Time */}
                    {post.recipePrepTime && (
                      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                              <Timer className="h-6 w-6 text-green-700" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Prep Time</p>
                              <p className="font-semibold text-lg">{post.recipePrepTime}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Cook Time */}
                    {post.recipeCookTime && (
                      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                              <CookingPot className="h-6 w-6 text-green-700" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Cook Time</p>
                              <p className="font-semibold text-lg">{post.recipeCookTime}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Servings */}
                    {post.recipeServings && (
                      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                              <Users className="h-6 w-6 text-green-700" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Servings</p>
                              <p className="font-semibold text-lg">{post.recipeServings}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Cuisine and Diet Tags */}
                {(post.recipeCuisine || (post.recipeDiet && post.recipeDiet.length > 0)) && (
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-4 space-y-3">
                      {post.recipeCuisine && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Cuisine</p>
                          <Badge className="bg-green-600 text-white">
                            {post.recipeCuisine.charAt(0).toUpperCase() + post.recipeCuisine.slice(1)}
                          </Badge>
                        </div>
                      )}
                      {post.recipeDiet && post.recipeDiet.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Dietary Information</p>
                          <div className="flex flex-wrap gap-2">
                            {post.recipeDiet.map((diet, index) => (
                              <Badge key={index} variant="outline" className="border-green-300 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {diet.replace('-', ' ').charAt(0).toUpperCase() + diet.replace('-', ' ').slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Ingredients List */}
                {post.recipeIngredients && post.recipeIngredients.length > 0 && (
                  <InteractiveCheckList
                    title="Ingredients"
                    items={post.recipeIngredients}
                    icon={UtensilsCrossed}
                    storageKey={`recipe-ingredients-${post._id}`}
                    className="border-green-200"
                  />
                )}

                {/* Affiliate Links */}
                {post.affiliateLinks && post.affiliateLinks.length > 0 && (
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-green-700" />
                        Recommended Products
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        These are products the author recommends for this recipe
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {post.affiliateLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="block p-4 rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-900 group-hover:text-green-700 transition-colors flex items-center gap-2">
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

            {/* Recipe Content */}
            <div className="blog-content mb-12 p-6 bg-white rounded-xl shadow-sm border border-green-100">
              <div 
                className="prose prose-green max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* ✅ BOTTOM AD - After Recipe Content */}
            <div className="my-8">
              <AdSense 
                adSlot="1347673049"
                adFormat="auto"
                adStyle={{ display: 'block', textAlign: 'center' }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-green-700" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* ⭐ Rating Section */}
            <section className="mb-12">
              <RatingSection postId={post._id} />
            </section>

            <Separator className="my-8" />

            {/* 📸 I Made This Section */}
            <section className="mb-12">
              <IMadeThisSection postId={post._id} contentType="recipe" />
            </section>

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

              {/* 🔖 Bookmark Button */}
              <BookmarkButton
                postId={post._id}
                initialBookmarked={session?.user?.id && post.saves?.includes(session.user.id)}
                initialCount={post.saves?.length || 0}
                size="default"
                showCount={true}
              />

              {/* ✨ Using dynamic state */}
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{commentStats.approved}</span>
                <span className="hidden sm:inline">Comments</span>
              </Button>
            </div>

            {/* Comments Section */}
            <section className="mb-12">
              <CommentSection 
                postId={post._id} 
                allowComments={post.allowComments}
                showStats={true}
                onStatsUpdate={handleCommentStatsUpdate}
              />
            </section>

            <Separator className="my-8" />

            {/* Author Bio */}
            <Card className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {post.author?.profilePictureUrl ? (
                      <Image
                        src={post.author.profilePictureUrl}
                        alt={post.author.name}
                        width={80}
                        height={80}
                        className="rounded-full ring-4 ring-green-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center ring-4 ring-green-300">
                        <User className="h-10 w-10 text-green-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      <Link href={`/author/${post.author?.username}`} className="hover:text-green-600 transition-colors">
                        {post.author?.name}
                      </Link>
                    </h3>
                    <p className="text-gray-700 mb-3">
                      {post.author?.bio || 'Passionate cook sharing delicious recipes!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Recipes */}
            {relatedPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <UtensilsCrossed className="h-6 w-6 text-green-700" />
                  More Recipes by {post.author?.name}
                </h2>
                <p className="text-muted-foreground mb-6">
                  Try these other amazing recipes from the same author
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost._id} href={`/recipe/${relatedPost.slug}`}>
                      <Card className="hover:shadow-xl transition-all cursor-pointer group h-full overflow-hidden border-green-100">
                        <div className="relative h-40 overflow-hidden">
                          {relatedPost.featuredImageUrl ? (
                            <Image
                              src={relatedPost.featuredImageUrl}
                              alt={relatedPost.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-200 to-emerald-200 flex items-center justify-center">
                              <ChefHat className="h-8 w-8 text-green-700" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-green-600 transition-colors">
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
                className="hover:bg-green-600 hover:text-white hover:border-green-600 transition-all"
              >
                <Link href="/recipe">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Recipes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
