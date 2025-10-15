import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8 fade-in">
        <div className="h-8 sm:h-10 bg-muted rounded-lg w-64 sm:w-96 mb-2 animate-pulse"></div>
        <div className="h-5 sm:h-6 bg-muted rounded-lg w-48 sm:w-64 animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="scale-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="fade-in" style={{ animationDelay: `${i * 150}ms` }}>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="h-6 bg-muted rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="h-11 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-11 bg-muted rounded w-full animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
