"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import BlogPostTags from "./BlogPostTags"
import BlogPostActions from "./BlogPostActions"

/**
 * BlogPostFooter Component
 * Displays tags, actions, and back button
 */
export default function BlogPostFooter({ post, commentStats }) {
    return (
        <>
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <BlogPostTags tags={post.tags} />
                </div>
            )}

            <Separator className="my-6" />

            {/* Actions */}
            <BlogPostActions
                postId={post._id}
                initialLikes={post.likes}
                commentStats={commentStats}
                title={post.title}
            />

            <Separator className="my-6" />

            {/* Back to Blog Button */}
            <div className="text-center mt-8">
                <Button variant="outline" size="lg" asChild className="min-h-[44px]">
                    <Link href="/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Blog
                    </Link>
                </Button>
            </div>
        </>
    )
}
