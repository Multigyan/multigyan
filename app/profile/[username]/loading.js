import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Hero Section Skeleton */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Profile Picture Skeleton */}
                            <Skeleton className="h-32 w-32 rounded-full bg-white/20" />

                            {/* Profile Info Skeleton */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <Skeleton className="h-10 w-64 bg-white/20 mx-auto md:mx-0" />
                                <Skeleton className="h-6 w-32 bg-white/20 mx-auto md:mx-0" />
                                <div className="flex gap-2 justify-center md:justify-start">
                                    <Skeleton className="h-6 w-20 bg-white/20" />
                                    <Skeleton className="h-6 w-20 bg-white/20" />
                                </div>
                                <Skeleton className="h-20 w-full max-w-2xl bg-white/20 mx-auto md:mx-0" />
                                <div className="flex gap-3 justify-center md:justify-start">
                                    <Skeleton className="h-10 w-24 bg-white/20" />
                                    <Skeleton className="h-10 w-32 bg-white/20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar Skeleton */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="text-center space-y-2">
                                    <Skeleton className="h-8 w-16 mx-auto" />
                                    <Skeleton className="h-4 w-20 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Skeleton */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-40" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="md:col-span-2 space-y-6">
                        {/* About Section Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>

                        {/* Posts Section Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-48 mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-6 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                            <div className="flex gap-4">
                                                <Skeleton className="h-3 w-20" />
                                                <Skeleton className="h-3 w-20" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
