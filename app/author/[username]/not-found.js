import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserX, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <UserX className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Author Not Found
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            The author you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <p className="text-sm text-gray-500">
            Please check the URL or browse our list of authors.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/authors">
              <Search className="mr-2 h-5 w-5" />
              Browse All Authors
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
