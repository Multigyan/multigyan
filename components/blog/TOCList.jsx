"use client"

import { cn } from "@/lib/utils"

export default function TOCList({ headings, activeId, onItemClick, variant = "default" }) {
    if (!headings || headings.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                No headings found
            </p>
        )
    }

    return (
        <nav className="space-y-1">
            {headings.map((heading, index) => (
                <button
                    key={heading.id}
                    onClick={() => onItemClick(heading.id)}
                    className={cn(
                        "w-full text-left text-sm py-2 px-3 rounded-md transition-all cursor-pointer",
                        heading.level === 'h3' && "pl-6 text-xs",
                        variant === "mobile" && "py-3 px-4 min-h-[44px]",
                        activeId === heading.id
                            ? variant === "mobile"
                                ? "bg-primary text-primary-foreground font-medium shadow-md scale-[1.02]"
                                : "bg-primary/10 text-primary font-medium border-l-2 border-primary scale-105"
                            : "hover:bg-muted hover:scale-105 active:scale-[0.98]"
                    )}
                    type="button"
                    aria-label={`Go to section: ${heading.text}`}
                >
                    <div className="flex items-start gap-2">
                        <span className={cn(
                            "font-mono text-xs mt-0.5 flex-shrink-0",
                            activeId === heading.id
                                ? variant === "mobile" ? "font-bold" : "text-primary font-semibold"
                                : "text-muted-foreground"
                        )}>
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="line-clamp-2 leading-relaxed">{heading.text}</span>
                    </div>
                </button>
            ))}
        </nav>
    )
}
