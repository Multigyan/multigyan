'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function HomeError({ error, reset }) {
    useEffect(() => {
        console.error('Homepage error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mb-8">
                        <AlertCircle className="h-24 w-24 text-destructive mx-auto mb-6 animate-pulse" />
                        <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            We encountered an error while loading the homepage. Don't worry, we're on it!
                        </p>
                        {process.env.NODE_ENV === 'development' && error && (
                            <details className="text-left bg-muted p-4 rounded-lg mb-6">
                                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                                <pre className="text-sm overflow-auto">{error.message}</pre>
                            </details>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={reset} size="lg" className="gap-2">
                            <RefreshCw className="h-5 w-5" />
                            Try Again
                        </Button>
                        <Button variant="outline" size="lg" asChild className="gap-2">
                            <Link href="/">
                                <Home className="h-5 w-5" />
                                Go Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
