"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Eye, User } from "lucide-react"
import { formatDate } from "@/lib/helpers"

/**
 * BlogPostMeta Component
 * Displays author information and post metadata (date, reading time, views)
 */
export default function BlogPostMeta({ author, publishedAt, readingTime, views }) {
    return (
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
            {/* Author Info */}
            <div className="flex items-center gap-2 min-h-[44px]">
                {author?.profilePictureUrl ? (
                    <Image
                        src={author.profilePictureUrl}
                        alt={author.name}
                        width={28}
                        height={28}
                        className="rounded-full sm:w-8 sm:h-8"
                    />
                ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                )}
                <span className="font-medium" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <Link href={`/author/${author?.username}`} className="hover:text-foreground">
                        <span itemProp="name">{author?.name}</span>
                    </Link>
                </span>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 flex-wrap">
                {/* Publication Date */}
                <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <time className="text-xs sm:text-sm" itemProp="datePublished" dateTime={publishedAt}>
                        {formatDate(publishedAt)}
                    </time>
                </div>

                {/* Reading Time */}
                <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{readingTime} min</span>
                </div>

                {/* Views */}
                <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{views} views</span>
                </div>
            </div>
        </div>
    )
}
