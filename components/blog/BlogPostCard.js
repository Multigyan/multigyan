"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye, User, BookOpen } from "lucide-react"
import { formatDate } from "@/lib/helpers"
import BatchDynamicPostStats from "@/components/blog/BatchDynamicPostStats"

export default function BlogPostCard({ post, getPostUrl }) {
    return (
        <Link href={getPostUrl(post)} className="block">
            <Card className="blog-card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group h-full">
                <div className="relative h-48 overflow-hidden">
                    {post.featuredImageUrl ? (
                        <Image
                            src={post.featuredImageUrl}
                            alt={post.featuredImageAlt || post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-primary/60" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                </div>

                <CardContent className="p-6 pt-0 mt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge style={{ backgroundColor: post.category?.color }}>
                            {post.category?.name}
                        </Badge>
                    </div>

                    <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
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
                                <span className="text-sm text-muted-foreground truncate">
                                    {post.author?.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span className="hidden sm:inline">{formatDate(post.publishedAt)}</span>
                                <span className="sm:hidden">{formatDate(post.publishedAt).split(',')[0]}</span>
                            </div>
                        </div>

                        <div className="border-t" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {post.readingTime} min
                                </span>
                                {post.views > 0 && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Eye className="h-3 w-3" />
                                        {post.views}
                                    </span>
                                )}
                            </div>

                            <BatchDynamicPostStats
                                postId={post._id}
                                initialLikes={post.likeCount ?? post.likes?.length ?? 0}
                                initialComments={post.commentCount ?? post.comments?.filter(c => c.isApproved).length ?? 0}
                                compact={true}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
