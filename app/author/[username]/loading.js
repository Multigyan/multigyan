export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section Skeleton */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Profile Picture Skeleton */}
                        <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>

                        {/* Author Info Skeleton */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="h-10 bg-white/20 rounded w-64 mx-auto md:mx-0 animate-pulse"></div>
                            <div className="h-6 bg-white/20 rounded w-48 mx-auto md:mx-0 animate-pulse"></div>
                            <div className="h-4 bg-white/20 rounded w-96 max-w-full mx-auto md:mx-0 animate-pulse"></div>

                            {/* Stats Skeleton */}
                            <div className="flex gap-6 justify-center md:justify-start mt-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-8 bg-white/20 rounded w-16 animate-pulse"></div>
                                        <div className="h-4 bg-white/20 rounded w-20 animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Posts Grid Skeleton - 3 columns */}
                    <div className="lg:col-span-3">
                        <div className="mb-8">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 animate-pulse">
                                    {/* Image Skeleton */}
                                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>

                                    {/* Content Skeleton */}
                                    <div className="p-6 space-y-4">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Skeleton - 1 column */}
                    <div className="space-y-6">
                        {/* Popular Posts Skeleton */}
                        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Categories Skeleton */}
                        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter Skeleton */}
                        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
                            <div className="space-y-3">
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
