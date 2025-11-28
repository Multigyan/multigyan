"use client"

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Client-Side Pagination Component
 * For use in client components that manage pagination state locally
 * Unlike the server-side Pagination component, this uses onClick handlers
 */
export default function ClientPagination({
    currentPage,
    totalPages,
    onPageChange,
    className = ''
}) {
    if (totalPages <= 1) return null

    const renderPageNumbers = () => {
        const pages = []
        const maxVisible = 5

        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
        let endPage = Math.min(totalPages, startPage + maxVisible - 1)

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1)
        }

        // First page
        if (startPage > 1) {
            pages.push(
                <Button
                    key={1}
                    variant={1 === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(1)}
                    className="min-w-[40px]"
                >
                    1
                </Button>
            )

            if (startPage > 2) {
                pages.push(
                    <span key="ellipsis-start" className="px-2 text-muted-foreground">
                        ...
                    </span>
                )
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={i === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(i)}
                    className="min-w-[40px]"
                >
                    {i}
                </Button>
            )
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="ellipsis-end" className="px-2 text-muted-foreground">
                        ...
                    </span>
                )
            }

            pages.push(
                <Button
                    key={totalPages}
                    variant={totalPages === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    className="min-w-[40px]"
                >
                    {totalPages}
                </Button>
            )
        }

        return pages
    }

    return (
        <nav
            className={`flex items-center justify-center gap-2 ${className}`}
            aria-label="Pagination"
        >
            {/* Previous Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {renderPageNumbers()}
            </div>

            {/* Next Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </nav>
    )
}
