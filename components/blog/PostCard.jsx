"use client"

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
import { formatDate } from "@/lib/helpers"

export default function PostCard({ post, featured = false }) {
  // Get counts
  const likesCount = post.likes?.length || 0
  const commentsCount = post.comments?.filter(c => c.isApproved).length || 0
  const viewsCount = post.views || 0

  return (
    <Link href={`/blog/${post.slug}`} className="block h-full">
      <Card className="blog-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* ✅ IMPROVED: Featured Image - Consistent 16:9 Aspect Ratio */}
        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
          {post.featuredImageUrl ? (
            <Image
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
              <Badge variant="secondary" className="bg-yellow-500 text-white shadow-lg text-xs sm:text-sm">
                Featured
              </Badge>
            </div>
          )}
        </div>
        
        {/* ✅ IMPROVED: Content with better mobile spacing */}
        <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Badge 
              style={{ backgroundColor: post.category?.color }}
              className="text-white text-xs sm:text-sm"
            >
              {post.category?.name}
            </Badge>
          </div>
          
          {/* ✅ IMPROVED: Title with better mobile sizing */}
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          
          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">
              {post.excerpt}
            </p>
          )}
          
          {/* ✅ IMPROVED: Meta Information with better mobile layout */}
          <div className="space-y-2 sm:space-y-3 mt-auto">
            {/* ✅ IMPROVED: Author & Date - Better mobile wrapping */}
            <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
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
                <span className="text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  {post.author?.name}
                </span>
              </div>
              
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
