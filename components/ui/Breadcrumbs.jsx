'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Breadcrumbs Component
 * Displays navigation breadcrumb trail for better UX and SEO
 * 
 * @param {Array} items - Array of breadcrumb items with name and url
 * @param {string} className - Optional additional CSS classes
 */
export default function Breadcrumbs({ items = [], className = '' }) {
    if (!items || items.length === 0) return null

    return (
        <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
            <ol className="flex items-center space-x-1">
                {/* Home icon for first item */}
                <li className="flex items-center">
                    <Link
                        href="/"
                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                        aria-label="Home"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <li key={index} className="flex items-center">
                            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" aria-hidden="true" />
                            {isLast ? (
                                <span
                                    className="text-foreground font-medium"
                                    aria-current="page"
                                >
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={item.url}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
