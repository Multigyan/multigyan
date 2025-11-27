import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/helpers'

export default async function PopularPosts({ limit = 5 }) {
    // Fetch popular posts
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/posts?status=published&sortBy=views&sortOrder=desc&limit=${limit}`, {
        next: { revalidate: 300 } // 5 minutes
    })

    const data = await res.json()
    const posts = data.posts || []

    if (posts.length === 0) return null

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Popular Posts
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {posts.map((post, index) => (
                    <Link
                        key={post._id}
                        href={`/blog/${post.slug}`}
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
