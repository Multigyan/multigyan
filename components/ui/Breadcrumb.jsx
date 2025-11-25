import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export default function Breadcrumb({ items = [] }) {
    if (items.length === 0) return null

    return (
        <nav
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6 overflow-x-auto pb-2"
            aria-label="Breadcrumb"
        >
            <Link
                href="/"
                className="hover:text-foreground transition-colors flex items-center gap-1 whitespace-nowrap"
                aria-label="Home"
            >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1

                return (
                    <div key={index} className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        {isLast ? (
                            <span
                                className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none"
                                aria-current="page"
                            >
                                {item.name}
                            </span>
                        ) : (
                            <Link
                                href={item.url}
                                className="hover:text-foreground transition-colors whitespace-nowrap"
                            >
                                {item.name}
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
