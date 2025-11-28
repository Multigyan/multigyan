"use client"

import TOCDesktopSidebar from "@/components/blog/TOCDesktopSidebar"

/**
 * BlogPostSidebar Component
 * Wrapper for desktop TOC sidebar
 */
export default function BlogPostSidebar({ headings, activeId, readingProgress, readingTime, scrollToHeading, scrollToTop }) {
    return (
        <div className="hidden lg:block lg:w-1/3 lg:flex-shrink-0">
            <div className="toc-sidebar-wrapper">
                <TOCDesktopSidebar
                    headings={headings}
                    activeId={activeId}
                    readingProgress={readingProgress}
                    readingTime={readingTime}
                    onItemClick={scrollToHeading}
                    scrollToTop={scrollToTop}
                />
            </div>
        </div>
    )
}
