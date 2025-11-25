'use client'

export default function Error({ error, reset }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-destructive"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Category Error</h2>
                    <p className="text-muted-foreground mb-6">
                        We encountered an error while loading this category. Please try again.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => reset()}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Try again
                    </button>
                    <a
                        href="/blog"
                        className="block w-full px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
                    >
                        Browse all articles
                    </a>
                </div>

                {process.env.NODE_ENV === 'development' && error && (
                    <details className="mt-6 text-left">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            Error details (development only)
                        </summary>
                        <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                            {error.message}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    )
}
