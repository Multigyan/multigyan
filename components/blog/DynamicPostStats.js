"use client"

import useSWR from "swr"
import { Heart, MessageCircle } from "lucide-react"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DynamicPostStats({
    postId,
    initialLikes = 0,
    initialComments = 0,
    compact = false
}) {
    // Fetch real-time stats with SWR
    const { data } = useSWR(
        `/api/posts/${postId}/stats`,
        fetcher,
        {
            fallbackData: { likes: initialLikes, comments: initialComments },
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: true,
            dedupingInterval: 10000, // Dedupe requests within 10s
        }
    )

    const likes = data?.likes || 0
    const comments = data?.comments || 0

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 group-hover:bg-red-100">
                    <Heart className="h-3 w-3 fill-current" />
                    <span className="text-xs font-semibold">{likes}</span>
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                    <MessageCircle className="h-3 w-3" />
                    <span className="text-xs font-semibold">{comments}</span>
                </span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-red-600">
                <Heart className="h-4 w-4 fill-current" />
                <span className="font-semibold">{likes}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
                <MessageCircle className="h-4 w-4" />
                <span className="font-semibold">{comments}</span>
            </div>
        </div>
    )
}
