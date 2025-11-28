"use client"

import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import { PostLikeButton } from "@/components/interactions/LikeButton"
import ShareButtons from "@/components/blog/ShareButtons"

/**
 * BlogPostActions Component
 * Displays like button, comment count, and share buttons
 */
export default function BlogPostActions({ postId, initialLikes, commentStats, title }) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 border-t border-b">
            {/* Left: Like and Comment */}
            <div className="flex items-center gap-4">
                {/* Like Button */}
                <PostLikeButton
                    postId={postId}
                    initialLikes={initialLikes}
                    variant="outline"
                    size="default"
                    className="min-h-[44px] w-full sm:w-auto"
                />

                {/* Comment Count */}
                <Button
                    variant="outline"
                    size="default"
                    asChild
                    className="min-h-[44px] w-full sm:w-auto"
                >
                    <a href="#comments" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{commentStats.approved}</span>
                        <span className="hidden sm:inline text-sm">Comments</span>
                    </a>
                </Button>
            </div>

            {/* Right: Share Buttons */}
            <ShareButtons title={title} />
        </div>
    )
}
