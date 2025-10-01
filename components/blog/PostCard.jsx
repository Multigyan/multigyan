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
    <Card className="blog-card overflow-hidden group">
      <Link href={`/blog/${post.slug}`}>
        {/* Featured Image */}
        <div className="relative h-48 overflow-hidden">
          {post.featuredImageUrl ? (
            <Image
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/60" />
            </div>
          )}
          
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-yellow-500 text-white">
                Featured
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="p-6">
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
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between border-t pt-4">
            {/* Author */}
            <div className="flex items-center gap-2">
              {post.author?.profilePictureUrl ? (
                <Image
                  src={post.author.profilePictureUrl}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
              )}
              <span className="text-sm text-muted-foreground">
                {post.author?.name}
              </span>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {/* Reading Time */}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime} min
              </span>
              
              {/* Views */}
              {viewsCount > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {viewsCount}
                </span>
              )}
              
              {/* Likes */}
              {likesCount > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <Heart className="h-3 w-3 fill-current" />
                  {likesCount}
                </span>
              )}
              
              {/* Comments */}
              {commentsCount > 0 && (
                <span className="flex items-center gap-1 text-blue-500">
                  <MessageCircle className="h-3 w-3" />
                  {commentsCount}
                </span>
              )}
            </div>
          </div>
          
          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
