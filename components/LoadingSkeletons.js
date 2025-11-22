import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Loading Skeleton Component
 * 
 * Reusable skeleton loader for admin pages
 * Provides better perceived performance during data loading
 */

export function AdminPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="mb-8 animate-pulse">
                <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                            <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search/Filter Skeleton */}
            <div className="mb-6 animate-pulse">
                <div className="h-10 bg-muted rounded max-w-md"></div>
            </div>

            {/* Content List Skeleton */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-12 w-12 bg-muted rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-5 bg-muted rounded w-48 mb-2"></div>
                                        <div className="h-4 bg-muted rounded w-64"></div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-9 w-24 bg-muted rounded"></div>
                                    <div className="h-9 w-24 bg-muted rounded"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Table Header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {[...Array(columns)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
            </div>

            {/* Table Rows */}
            {[...Array(rows)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {[...Array(columns)].map((_, colIndex) => (
                        <div key={colIndex} className="h-12 bg-muted rounded"></div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export function CardGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
