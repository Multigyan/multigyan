'use client'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Something went wrong!
          </h2>
          <p className="text-gray-600 mb-2">
            {error.message || 'An unexpected error occurred'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technical Details (Development Only)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <a
            href="/authors"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Browse Authors
          </a>
        </div>
      </div>
    </div>
  )
}
