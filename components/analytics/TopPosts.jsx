"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart, MessageSquare, TrendingUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { getPostUrl } from '@/lib/helpers'

/**
 * TopPosts Component
 * 
 * Display top performing posts based on analytics
 */

export default function TopPosts({ days = 30, limit = 10 }) {
    const [loading, setLoading] = useState(true)
    const [topPosts, setTopPosts] = useState([])

    useEffect(() => {
        fetchTopPosts()
    }, [days, limit])

    const fetchTopPosts = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/analytics/dashboard?action=top-posts&days=${days}&limit=${limit}`)
            const data = await response.json()

            if (response.ok) {
                setTopPosts(data.topPosts || [])
            } else {
                toast.error('Failed to load top posts')
            }
        } catch (error) {
            console.error('Fetch top posts error:', error)
            toast.error('Failed to load top posts')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Performing Posts
                </CardTitle>
                <CardDescription>
                    Best performing content in the last {days} days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {topPosts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No analytics data available yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        {topPosts.map((item, index) => (
                            <Link
                                key={item.post._id}
                                href={getPostUrl(item.post)}
                                className="block"
                            >
                                <div className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary transition-colors">
                                    {/* Rank */}
                                    <div className="flex-shrink-0">
                                        <Badge
                                            variant={index === 0 ? 'default' : 'secondary'}
                                            className="w-8 h-8 flex items-center justify-center rounded-full"
                                        >
                                            {index + 1}
                                        </Badge>
                                    </div>

                                    {/* Featured Image */}
                                    {item.post.featuredImageUrl && (
                                        <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.post.featuredImageUrl}
                                                alt={item.post.title}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate mb-1">{item.post.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                            <span>{item.post.author?.name}</span>
                                            <span>•</span>
                                            <span>{item.post.category?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                <span>{item.metrics.totalViews.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-3 w-3" />
                                                <span>{item.metrics.totalLikes.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                <span>{item.metrics.totalComments.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
