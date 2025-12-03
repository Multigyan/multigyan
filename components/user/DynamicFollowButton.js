"use client"

import { useState } from "react"
import useSWR from "swr"
import { UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DynamicFollowButton({
    userId,
    initialIsFollowing = false,
    initialFollowerCount = 0,
    variant = "default",
    size = "default"
}) {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)

    // Fetch real-time follow status
    const { data, mutate } = useSWR(
        session?.user?.id ? `/api/users/${userId}/follow-status` : null,
        fetcher,
        {
            fallbackData: {
                isFollowing: initialIsFollowing,
                followerCount: initialFollowerCount
            },
            refreshInterval: 60000, // Refresh every minute
            revalidateOnFocus: true,
        }
    )

    const isFollowing = data?.isFollowing || false
    const followerCount = data?.followerCount || 0

    const handleFollow = async () => {
        if (!session) {
            toast.error("Please sign in to follow users")
            return
        }

        if (session.user.id === userId) {
            toast.error("You cannot follow yourself")
            return
        }

        setIsLoading(true)

        try {
            // Optimistic update
            mutate({
                isFollowing: !isFollowing,
                followerCount: isFollowing ? followerCount - 1 : followerCount + 1
            }, false)

            const response = await fetch(`/api/users/${userId}/follow`, {
                method: 'POST',
            })

            if (!response.ok) throw new Error('Failed to update follow status')

            const result = await response.json()

            toast.success(result.isFollowing ? "Following user" : "Unfollowed user")

            // Revalidate to get actual data
            mutate()
        } catch (error) {
            toast.error("Failed to update follow status")
            // Revert optimistic update
            mutate()
        } finally {
            setIsLoading(false)
        }
    }

    if (!session || session.user.id === userId) {
        return null
    }

    return (
        <Button
            variant={isFollowing ? "outline" : variant}
            size={size}
            onClick={handleFollow}
            disabled={isLoading}
            className="gap-2"
        >
            {isFollowing ? (
                <>
                    <UserMinus className="h-4 w-4" />
                    Unfollow
                </>
            ) : (
                <>
                    <UserPlus className="h-4 w-4" />
                    Follow
                </>
            )}
            {followerCount > 0 && (
                <span className="text-xs opacity-70">({followerCount})</span>
            )}
        </Button>
    )
}
