"use client"

import React from 'react'
import { BatchStatsProvider } from './BatchStatsProvider'
import BlogPostCard from './BlogPostCard'

/**
 * Client wrapper for category post grid with batch stats
 */
export default function CategoryPostGrid({ posts, getPostUrl }) {
    const postIds = posts.map(p => p._id)

    return (
        <BatchStatsProvider postIds={postIds}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                {posts.map((post) => (
                    <BlogPostCard key={post._id} post={post} getPostUrl={getPostUrl} />
                ))}
            </div>
        </BatchStatsProvider>
    )
}
