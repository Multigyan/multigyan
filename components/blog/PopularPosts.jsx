"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/helpers'

export default function PopularPosts({ contentType = null, authorId = null, limit = 5 }) {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPopularPosts()
    }, [contentType, authorId, limit])

    const fetchPopularPosts = async () => {
        try {
            setLoading(true)
            let url = `/api/posts?status=published&sortBy=views&sortOrder=desc&limit=${limit}`

            if (contentType) {
                url += `&contentType=${contentType}`
            }

            if (authorId) {
                url += `&author=${authorId}`
            }

            const res = await fetch(url)
            const data = await res.json()

            if (res.ok) {
                setPosts(data.posts || [])
            }
        } catch (error) {
            console.error('Error fetching popular posts:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-16 h-16 bg-muted rounded animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                                <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (posts.length === 0) return null

    const getPostUrl = (post) => {
        if (post.contentType === 'diy') return `/diy/${post.slug}`
        if (post.contentType === 'recipe') return `/recipe/${post.slug}`
        return `/blog/${post.slug}`
    }

    const getTitle = () => {
        if (authorId) return 'Popular Posts'
        if (contentType === 'diy') return 'Popular DIY'
        if (contentType === 'recipe') return 'Popular Recipes'
        return 'Popular Posts'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {getTitle()}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {posts.map((post, index) => (
                    <Link
                        key={post._id}
                        href={getPostUrl(post)}
                        className="flex gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    >
                        {/* Thumbnail */}
                        {post.featuredImageUrl && (
                            <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                                <Image
                                    src={post.featuredImageUrl}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform"
                                    sizes="64px"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                {post.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                <span>{post.views || 0} views</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    )
}
