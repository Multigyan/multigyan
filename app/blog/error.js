'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

/**
 * Error boundary for blog page
 * Displays user-friendly error message with recovery options
 */
export default function Error({
    error,
    reset,
}) {
    useEffect(() => {
        // Log error to console for debugging
        console.error('Blog page error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        {/* Error Icon */}
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>

                        {/* Error Message */}
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
                            <p className="text-muted-foreground">
                                We encountered an error while loading the blog page. This could be due to a temporary issue.
                            </p>
                        </div>

                        {/* Error Details (only in development) */}
                        {process.env.NODE_ENV === 'development' && error && (
                            <div className="w-full p-4 bg-muted rounded-lg text-left">
                                <p className="text-sm font-mono text-red-600 break-all">
                                    {error.message || 'Unknown error'}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <Button
                                onClick={reset}
                                className="flex-1"
                                variant="default"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                asChild
                                className="flex-1"
                                variant="outline"
                            >
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Link>
                            </Button>
                        </div>

                        {/* Help Text */}
                        <p className="text-sm text-muted-foreground">
                            If the problem persists, please{' '}
                            <Link href="/contact" className="text-primary hover:underline">
                                contact support
                            </Link>
                            .
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
