'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('Error Boundary caught an error:', error, errorInfo)

        this.setState({
            error: error,
            errorInfo: errorInfo
        })

        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo)
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        })
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="container mx-auto px-4 py-8">
                    <Card className="max-w-2xl mx-auto border-destructive">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                                <CardTitle className="text-2xl">Something went wrong</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                We encountered an unexpected error. This has been logged and we'll look into it.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="bg-muted p-4 rounded-lg">
                                    <p className="font-semibold mb-2">Error Details (Development Only):</p>
                                    <pre className="text-sm overflow-auto">
                                        {this.state.error.toString()}
                                    </pre>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-sm font-semibold">
                                                Component Stack
                                            </summary>
                                            <pre className="text-xs mt-2 overflow-auto">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button onClick={this.handleReset} className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/dashboard/admin'}
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
