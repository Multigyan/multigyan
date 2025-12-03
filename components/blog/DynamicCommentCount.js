"use client"

import useSWR from "swr"
import { MessageCircle } from "lucide-react"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DynamicCommentCount({ postId, initialCount = 0 }) {
    // Fetch real-time comment count with SWR
    // Revalidates every 30 seconds
    const { data } = useSWR(
        `/api/posts/${postId}/comments/count`,
        fetcher,
        {
            fallbackData: { count: initialCount },
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: true,
        }
    )

    const count = data?.count || 0

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{count} {count === 1 ? 'Comment' : 'Comments'}</span>
        </div>
    )
}
