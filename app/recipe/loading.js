import { Card, CardContent } from '@/components/ui/card'
import { ChefHat } from 'lucide-react'

export default function RecipeLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section Skeleton */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <ChefHat className="h-10 w-10 animate-pulse" />
                        <div className="h-12 bg-white/20 rounded w-64 animate-pulse"></div>
                    </div>
                    <div className="h-8 bg-white/20 rounded w-96 mb-2 animate-pulse"></div>
                    <div className="h-6 bg-white/20 rounded w-full max-w-2xl animate-pulse"></div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <main className="container mx-auto px-4 py-12">
                {/* Filters Skeleton */}
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 h-12 bg-muted rounded animate-pulse"></div>
                    <div className="w-full md:w-48 h-12 bg-muted rounded animate-pulse"></div>
                    <div className="w-full md:w-48 h-12 bg-muted rounded animate-pulse"></div>
                </div>

                {/* Results Count Skeleton */}
                <div className="mb-6">
                    <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {[...Array(9)].map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            {/* Image Skeleton */}
                            <div className="h-48 bg-muted animate-pulse"></div>

                            {/* Content Skeleton */}
                            <CardContent className="p-6 space-y-4">
                                {/* Category Badge */}
                                <div className="h-6 bg-muted rounded-full w-24 animate-pulse"></div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <div className="h-6 bg-muted rounded w-full animate-pulse"></div>
                                    <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                                </div>

                                {/* Excerpt */}
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                                </div>

                                {/* Meta Info */}
                                <div className="flex items-center gap-4">
                                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination Skeleton */}
                <div className="flex justify-center gap-2">
                    <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
                </div>
            </main>

            {/* CTA Section Skeleton */}
            <div className="container mx-auto px-4 py-12">
                <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-none">
                    <CardContent className="p-8 text-center">
                        <div className="h-12 w-12 bg-white/20 rounded-full mx-auto mb-4 animate-pulse"></div>
                        <div className="h-8 bg-white/20 rounded w-64 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-6 bg-white/20 rounded w-96 mx-auto mb-6 animate-pulse"></div>
                        <div className="h-12 bg-white rounded w-48 mx-auto animate-pulse"></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
