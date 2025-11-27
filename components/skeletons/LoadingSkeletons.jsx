'use client'

import { Card, CardContent } from '@/components/ui/card'

export function SkeletonCard() {
    return (
        <Card className="overflow-hidden animate-pulse">
            <div className="relative h-48 bg-muted"></div>
            <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-20 mb-3"></div>
                <div className="h-6 bg-muted rounded w-full mb-3"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="flex items-center gap-3">
                    <div className="h-3 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                </div>
            </CardContent>
        </Card>
    )
}

export function SkeletonAuthorCard() {
    return (
        <Card className="h-full animate-pulse">
            <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
                <div className="h-5 bg-muted rounded w-32 mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded w-24 mx-auto mb-3"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-8 bg-muted rounded w-20 mx-auto mb-3"></div>
                <div className="h-9 bg-muted rounded w-full"></div>
            </CardContent>
        </Card>
    )
}

export function SkeletonCategoryCard() {
    return (
        <Card className="h-full animate-pulse">
            <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                <div className="h-5 bg-muted rounded w-24 mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded w-16 mx-auto"></div>
            </CardContent>
        </Card>
    )
}

export function SkeletonFeaturedPost() {
    return (
        <Card className="overflow-hidden animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-full bg-muted"></div>
                <CardContent className="p-8">
                    <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-full mb-3"></div>
                    <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
                    <div className="flex items-center gap-4">
                        <div className="h-3 bg-muted rounded w-24"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}
