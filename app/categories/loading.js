import { Card, CardContent } from "@/components/ui/card"

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Loading */}
          <div className="text-center mb-12">
            <div className="h-12 w-96 mx-auto mb-6 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-full max-w-3xl mx-auto bg-muted rounded animate-pulse"></div>
          </div>

          {/* Stats Cards Loading */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-lg mx-auto mb-4 bg-muted animate-pulse"></div>
                  <div className="h-8 w-16 mx-auto mb-2 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-24 mx-auto bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Categories Grid Loading */}
          <div className="mb-12">
            <div className="h-8 w-64 mb-6 bg-muted rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-6 w-full mb-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-full mb-2 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
