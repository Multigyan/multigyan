'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw, ChefHat } from 'lucide-react'

export default function RecipeError({
    error,
    reset,
}) {
    useEffect(() => {
        console.error('Recipe Page Error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50/30 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="max-w-2xl w-full">
                <CardContent className="p-8 sm:p-12">
                    <div className="text-center">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <ChefHat className="h-20 w-20 text-green-600 animate-pulse" />
                                <AlertCircle className="h-8 w-8 text-destructive absolute -top-2 -right-2" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Oops! Something went wrong
                        </h1>

                        {/* Description */}
                        <p className="text-lg text-muted-foreground mb-2">
                            We encountered an error while loading the recipes page.
                        </p>
                        <p className="text-sm text-muted-foreground mb-8">
                            Don&#39;t worry, our team has been notified and we&#39;re working on it!
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && error && (
                            <details className="text-left bg-muted p-4 rounded-lg mb-6 max-w-full overflow-auto">
                                <summary className="cursor-pointer font-semibold text-sm mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="text-xs text-destructive whitespace-pre-wrap break-words">
                                    {error.message}
                                </pre>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={reset}
                                size="lg"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Try Again
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                asChild
                            >
                                <Link href="/">
                                    <Home className="mr-2 h-5 w-5" />
                                    Go Home
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                asChild
                            >
                                <Link href="/blog">
                                    Browse All Posts
                                </Link>
                            </Button>
                        </div>

                        {/* Help Text */}
                        <p className="text-xs text-muted-foreground mt-8">
                            If this problem persists, please{' '}
                            <Link href="/contact" className="text-green-600 hover:underline">
                                contact support
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
