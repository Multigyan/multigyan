"use client"

import React from 'react'
import { BatchStatsProvider } from './BatchStatsProvider'
import BlogPostCard from './BlogPostCard'

/**
 * Client wrapper for blog post grid with batch stats
 * This separates client-side logic from server components
 */
export default function BlogPostGrid({ posts, getPostUrl }) {
    // Extract post IDs for batch fetching
    const postIds = posts.map(p => p._id)

    return (
        <BatchStatsProvider postIds={postIds}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {posts.map((post) => (
                    <BlogPostCard key={post._id} post={post} getPostUrl={getPostUrl} />
                ))}
            </div>
        </BatchStatsProvider>
    )
}
