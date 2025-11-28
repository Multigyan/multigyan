"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  User,
  Eye,
  Heart,
  MessageCircle,
  BookOpen
} from "lucide-react"
import { formatDate, getPostUrl } from "@/lib/helpers"
import { prefetchProfileData } from "@/lib/prefetch-profile"

export default function PostCard({ post, featured = false }) {
  const router = useRouter()

  // ✅ FALLBACK: Handle both old (imageUrl) and new (featuredImageUrl) field names
  const imageUrl = post.featuredImageUrl || post.imageUrl;

  // ✅ FIX: Get counts from API response (likeCount, commentCount) or fallback to array length
  const likesCount = post.likeCount ?? post.likes?.length ?? 0
  const commentsCount = post.commentCount ?? post.comments?.filter(c => c.isApproved).length ?? 0
  const viewsCount = post.views || 0

  // ✅ FIX: Handle author click without nested anchor
  const handleAuthorClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (post.author?.username) {
      router.push(`/profile/${post.author.username}`)
    }
  }

  return (
    <Link href={getPostUrl(post)} className="block h-full">
      <Card className="blog-card overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 h-full flex flex-col border-2 border-transparent hover:border-primary/30 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm relative">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* ✅ IMPROVED: Featured Image - Consistent 16:9 Aspect Ratio */}
        <div className="relative w-full z-10" style={{ aspectRatio: '16 / 9' }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 flex items-center justify-center">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-primary/60 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />
            </div>
          )}

          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {/* Featured Badge */}
          {(featured || post.isFeatured) && (
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg text-xs sm:text-sm px-3 py-1 backdrop-blur-sm border border-yellow-400/50 animate-pulse">
                ⭐ Featured
              </Badge>
            </div>
          )}
        </div>

        {/* ✅ IMPROVED: Content with better mobile spacing */}
        <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col relative z-10">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Badge
              style={{ backgroundColor: post.category?.color }}
              className="text-white text-xs sm:text-sm px-3 py-1.5 shadow-md backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all hover:scale-105"
            >
              {post.category?.name}
            </Badge>
          </div>

          {/* ✅ IMPROVED: Title with better mobile sizing */}
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 line-clamp-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text group-hover:from-primary group-hover:to-primary/60 transition-all duration-500">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1 group-hover:text-foreground/70 transition-colors">
              {post.excerpt}
            </p>
          )}

          {/* ✅ IMPROVED: Meta Information with better mobile layout */}
          <div className="space-y-2 sm:space-y-3 mt-auto">
            {/* ✅ FIXED: Author & Date - No nested anchor tags */}
            <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <span
                onClick={handleAuthorClick}
                className="flex items-center gap-1.5 sm:gap-2 min-w-0 hover:text-primary transition-colors cursor-pointer"
              >
                {post.author?.profilePictureUrl ? (
                  <Image
                    src={post.author.profilePictureUrl}
                    alt={post.author.name}
                    width={20}
                    height={20}
                    className="rounded-full ring-2 ring-transparent group-hover:ring-primary transition-all sm:w-6 sm:h-6 flex-shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary transition-all flex-shrink-0">
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                  </div>
                )}
                <span className="text-muted-foreground truncate">
                  {post.author?.name}
                </span>
              </span>

              <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0">
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">{formatDate(post.publishedAt)}</span>
                <span className="sm:hidden">{formatDate(post.publishedAt).split(',')[0]}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t pt-2 sm:pt-3" />

            {/* ✅ IMPROVED: Stats Row - Better mobile layout with proper spacing */}
            <div className="flex items-center justify-between gap-2">
              {/* Left: Reading Time & Views */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs">
                <span className="flex items-center gap-1 group-hover:text-foreground transition-colors text-muted-foreground">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{post.readingTime} min</span>
                </span>

                {viewsCount > 0 && (
                  <span className="flex items-center gap-1 group-hover:text-foreground transition-colors text-muted-foreground">
                    <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    <span className="font-medium">{viewsCount}</span>
                  </span>
                )}
              </div>

              {/* ✅ IMPROVED: Right: Likes & Comments - Better mobile sizing */}
              <div className="flex items-center gap-2">
                {/* Likes */}
                <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-full bg-red-50 text-red-600 group-hover:bg-red-100 group-hover:scale-105 transition-all">
                  <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current flex-shrink-0" />
                  <span className="text-xs font-semibold">{likesCount}</span>
                </span>

                {/* Comments */}
                <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-105 transition-all">
                  <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                  <span className="text-xs font-semibold">{commentsCount}</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
