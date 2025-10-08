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
        {/* Featured Image - Fixed 16:9 Aspect Ratio */}
        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
          {post.featuredImageUrl ? (
            <Image
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="secondary" className="bg-yellow-500 text-white shadow-lg">
                Featured
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="p-6 flex-1 flex flex-col">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              style={{ backgroundColor: post.category?.color }}
              className="text-white"
            >
              {post.category?.name}
            </Badge>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          
          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
              {post.excerpt}
            </p>
          )}
          
          {/* Meta Information */}
          <div className="space-y-3 mt-auto">
            {/* Author & Date */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {post.author?.profilePictureUrl ? (
                  <Image
                    src={post.author.profilePictureUrl}
                    alt={post.author.name}
                    width={24}
                    height={24}
                    className="rounded-full ring-2 ring-transparent group-hover:ring-primary transition-all"
                  />
                ) : (
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary transition-all">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {post.author?.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t pt-3" />

            {/* Stats Row - More Prominent */}
            <div className="flex items-center justify-between">
              {/* Left: Reading Time & Views */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">{post.readingTime} min</span>
                </span>
                
                {viewsCount > 0 && (
                  <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="font-medium">{viewsCount}</span>
                  </span>
                )}
              </div>
              
              {/* Right: Likes & Comments - More Prominent */}
              <div className="flex items-center gap-3">
                {/* Likes */}
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 group-hover:bg-red-100 group-hover:scale-105 transition-all">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  <span className="text-xs font-semibold">{likesCount}</span>
                </span>
                
                {/* Comments */}
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-105 transition-all">
                  <MessageCircle className="h-3.5 w-3.5" />
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
