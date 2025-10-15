import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <FileQuestion className="w-32 h-32 text-gray-300 dark:text-gray-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-primary">404</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Sorry, we couldn&#39;t find the page you&#39;re looking for.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            The page might have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/blog">
              <Search className="w-5 h-5 mr-2" />
              Browse Blog Posts
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Popular pages:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link 
              href="/blog" 
              className="text-sm text-primary hover:underline"
            >
              Blog
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              href="/categories" 
              className="text-sm text-primary hover:underline"
            >
              Categories
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              href="/authors" 
              className="text-sm text-primary hover:underline"
            >
              Authors
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              href="/about" 
              className="text-sm text-primary hover:underline"
            >
              About Us
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              href="/contact" 
              className="text-sm text-primary hover:underline"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
