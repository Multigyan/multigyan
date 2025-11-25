import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading UI for blog page
 * Displays skeleton loaders while posts are being fetched
 */
export default function Loading() {
    return (
        <div className="min-h-screen">
            {/* Featured Section Skeleton */}
            <section className="bg-gradient-to-br from-background via-background to-muted/20 py-12 sm:py-14 md:py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-8 sm:mb-10 md:mb-12">
                        <Skeleton className="h-12 w-64 mx-auto mb-4" />
                        <Skeleton className="h-6 w-96 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Main featured skeleton */}
                        <div className="lg:col-span-2">
                            <Card className="h-full overflow-hidden">
                                <Skeleton className="h-56 sm:h-64 lg:h-80 w-full" />
                            </Card>
                        </div>

                        {/* Secondary featured skeletons */}
                        <div className="space-y-4 sm:space-y-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="overflow-hidden">
                                    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                                        <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Skeleton */}
            <section className="py-12 sm:py-14 md:py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Breadcrumbs skeleton */}
                    <Skeleton className="h-4 w-32 mb-6" />

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                        {/* Main Posts Area */}
                        <div className="lg:col-span-3">
                            {/* Search skeleton */}
                            <Skeleton className="h-12 w-full mb-6" />

                            {/* Header skeleton */}
                            <div className="mb-6">
                                <Skeleton className="h-8 w-48 mb-2" />
                                <Skeleton className="h-4 w-64" />
                            </div>

                            {/* Posts Grid Skeleton */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="overflow-hidden">
                                        <Skeleton className="h-40 sm:h-48 w-full" />
                                        <CardContent className="p-4 sm:p-6 space-y-3">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-6 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                            <div className="flex justify-between pt-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Skeleton */}
                        <div className="space-y-6 sm:space-y-8">
                            <Card>
                                <CardContent className="p-4 sm:p-6 space-y-3">
                                    <Skeleton className="h-6 w-32 mb-4" />
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="h-8 w-full" />
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 sm:p-6 space-y-3">
                                    <Skeleton className="h-6 w-32 mb-4" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
