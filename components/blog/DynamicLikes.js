"use client"

import { useState } from "react"
import useSWR from "swr"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DynamicLikes({ postId, initialLikes = [] }) {
    const { data: session } = useSession()
    const [isLiking, setIsLiking] = useState(false)

    // Fetch real-time likes data with SWR
    // Revalidates every 10 seconds automatically
    const { data, mutate } = useSWR(
        `/api/posts/${postId}/likes`,
        fetcher,
        {
            fallbackData: { likes: initialLikes, count: initialLikes.length },
            refreshInterval: 10000, // Refresh every 10 seconds
            revalidateOnFocus: true, // Refresh when user focuses tab
        }
    )

    const likes = data?.likes || []
    const likeCount = data?.count || 0
    const isLiked = session?.user?.id ? likes.includes(session.user.id) : false

    const handleLike = async () => {
        if (!session) {
            toast.error("Please sign in to like posts")
            return
        }

        setIsLiking(true)

        try {
            // Optimistic update
            const newLikes = isLiked
                ? likes.filter(id => id !== session.user.id)
                : [...likes, session.user.id]

            mutate({ likes: newLikes, count: newLikes.length }, false)

            const response = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
            })

            if (!response.ok) throw new Error('Failed to like post')

            // Revalidate to get actual data from server
            mutate()
        } catch (error) {
            toast.error("Failed to update like")
            // Revert optimistic update
            mutate()
        } finally {
            setIsLiking(false)
        }
    }

    return (
        <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="gap-2"
        >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
        </Button>
    )
}
