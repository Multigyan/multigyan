export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
            {/* Profile Picture */}
            <div className="h-32 w-32 bg-gray-300 rounded-full" />
            
            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="h-10 bg-gray-300 rounded w-3/4" />
              <div className="h-6 bg-gray-300 rounded w-1/2" />
              <div className="h-4 bg-gray-300 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4 py-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-2">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="animate-pulse flex gap-4">
      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 bg-gray-200 rounded w-16" />
          ))}
        </div>
      </div>
    </div>
  )
}
