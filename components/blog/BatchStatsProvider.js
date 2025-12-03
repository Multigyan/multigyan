"use client"

import { createContext, useContext } from 'react'
import useSWR from 'swr'

const BatchStatsContext = createContext(null)

const fetcher = (url) => fetch(url).then((res) => res.json())

// Provider component that fetches stats for all posts on the page
export function BatchStatsProvider({ postIds, children }) {
    const ids = postIds.join(',')

    const { data } = useSWR(
        postIds.length > 0 ? `/api/posts/batch-stats?ids=${ids}` : null,
        fetcher,
        {
            refreshInterval: 60000, // Refresh every minute
            revalidateOnFocus: true,
            dedupingInterval: 30000, // Dedupe requests within 30s
        }
    )

    return (
        <BatchStatsContext.Provider value={data?.stats || {}}>
            {children}
        </BatchStatsContext.Provider>
    )
}

// Hook to get stats for a specific post
export function useBatchStats(postId, initialLikes = 0, initialComments = 0) {
    const stats = useContext(BatchStatsContext)

    if (!stats || !stats[postId]) {
        return { likes: initialLikes, comments: initialComments }
    }

    return stats[postId]
}
