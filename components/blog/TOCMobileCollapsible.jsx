"use client"

import { BookOpen } from "lucide-react"
import TOCList from "./TOCList"

export default function TOCMobileCollapsible({ headings, activeId, onItemClick }) {
    if (!headings || headings.length === 0) return null

    return (
        <div className="lg:hidden mb-6 sm:mb-8">
            <details className="group border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted transition-colors list-none">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-semibold text-base">Table of Contents</span>
                    </div>
                    <svg
                        className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                <div className="p-4 pt-2 border-t border-border bg-muted/30">
                    <TOCList
                        headings={headings}
                        activeId={activeId}
                        onItemClick={onItemClick}
                        variant="default"
                    />
                </div>
            </details>
        </div>
    )
}
