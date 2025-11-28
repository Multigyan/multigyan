"use client"

import { Badge } from "@/components/ui/badge"
import LanguageSwitcher from "@/components/blog/LanguageSwitcher"
import StayConnected from "@/components/blog/StayConnected"
import BlogPostMeta from "./BlogPostMeta"

/**
 * BlogPostHeader Component
 * Displays the post header including category, title, excerpt, and metadata
 */
export default function BlogPostHeader({ post }) {
    return (
        <>
            {/* Category Badge & Language Switcher */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge style={{ backgroundColor: post.category?.color }} className="text-xs sm:text-sm">
                        {post.category?.name}
                    </Badge>
                    {post.isFeatured && (
                        <Badge variant="secondary" className="text-xs sm:text-sm">Featured</Badge>
                    )}
                </div>

                {/* Language Switcher */}
                <LanguageSwitcher post={post} />
            </div>

            {/* Title Section */}
            <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6" itemProp="headline">
                    {post.title}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 sm:mb-6" itemProp="description">
                        {post.excerpt}
                    </p>
                )}

                {/* Author & Metadata */}
                <BlogPostMeta
                    author={post.author}
                    publishedAt={post.publishedAt}
                    readingTime={post.readingTime}
                    views={post.views}
                />
            </header>

            {/* Stay Connected */}
            <StayConnected className="mb-4 sm:mb-6" />
        </>
    )
}
