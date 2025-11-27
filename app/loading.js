import { SkeletonCard, SkeletonFeaturedPost, SkeletonAuthorCard, SkeletonCategoryCard } from '@/components/skeletons/LoadingSkeletons'

export default function HomeLoading() {
    return (
        <div className="min-h-screen">
            {/* Hero Skeleton */}
            <section className="py-12 bg-gradient-to-br from-background via-primary/5 to-background">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-10">
                            <div className="h-16 bg-muted rounded w-3/4 mx-auto mb-6 animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mx-auto animate-pulse"></div>
                        </div>
                        <SkeletonFeaturedPost />
                    </div>
                </div>
            </section>

            {/* Articles Grid Skeleton */}
            <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="h-8 bg-muted rounded w-48 mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Skeleton */}
            <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="h-8 bg-muted rounded w-64 mx-auto mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <SkeletonCategoryCard key={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Authors Skeleton */}
            <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="h-8 bg-muted rounded w-56 mx-auto mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonAuthorCard key={i} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
