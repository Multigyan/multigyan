"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"

/**
 * BlogPostTags Component
 * Displays a list of post tags as badges
 */
export default function BlogPostTags({ tags }) {
    if (!tags || tags.length === 0) return null

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
                <Link key={index} href={`/tag/${encodeURIComponent(tag)}`}>
                    <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors">
                        {tag}
                    </Badge>
                </Link>
            ))}
        </div>
    )
}
