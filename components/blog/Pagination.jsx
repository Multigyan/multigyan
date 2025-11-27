import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }) {
    const getPageNumbers = () => {
        const pages = []
        const showPages = 5

        if (totalPages <= showPages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
            }
        }

        return pages
    }

    const buildUrl = (page) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        return `${baseUrl}?${params.toString()}`
    }

    if (totalPages <= 1) return null

    return (
        <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
            {/* Previous Button */}
            <Button
                variant="outline"
                size="icon"
                asChild={currentPage > 1}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                {currentPage > 1 ? (
                    <Link href={buildUrl(currentPage - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </Button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
                page === '...' ? (
                    <Button key={`ellipsis-${index}`} variant="ghost" size="icon" disabled>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        asChild={currentPage !== page}
                        disabled={currentPage === page}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {currentPage !== page ? (
                            <Link href={buildUrl(page)}>{page}</Link>
                        ) : (
                            <span>{page}</span>
                        )}
                    </Button>
                )
            ))}

            {/* Next Button */}
            <Button
                variant="outline"
                size="icon"
                asChild={currentPage < totalPages}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                {currentPage < totalPages ? (
                    <Link href={buildUrl(currentPage + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </Button>
        </nav>
    )
}
