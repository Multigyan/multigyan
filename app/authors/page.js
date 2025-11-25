import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenTool, Users as UsersIcon } from "lucide-react"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Post from "@/models/Post"
import { generateSEOMetadata } from "@/lib/seo"
import AuthorStatsGrid from "@/components/authors/AuthorStatsGrid"
import AuthorCard from "@/components/authors/AuthorCard"

// Revalidate every 10 seconds for fresher data
export const revalidate = 10

export const metadata = generateSEOMetadata({
  title: 'Authors - Meet Our Talented Writers',
  description: 'Discover the talented authors behind Multigyan. Connect with expert writers sharing knowledge across technology, programming, design, and more.',
  keywords: ['authors', 'writers', 'content creators', 'bloggers', 'experts'],
  canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/authors`,
  type: 'website'
})

export default async function AuthorsPage() {
  try {
    await connectDB()

    // ✅ OPTIMIZED: Sorting happens in the database, not in JavaScript
    const authorsWithPosts = await Post.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 },
          latestPost: { $max: '$publishedAt' },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } }
        }
      },
      // ✅ NEW: Sort by postCount descending at database level
      { $sort: { postCount: -1 } }
    ])

    const authorIds = authorsWithPosts.map(author => author._id)

    const authors = await User.find({
      _id: { $in: authorIds },
      isActive: true
    })
      .select('name email username profilePictureUrl bio role createdAt')
      .lean()

    // Create a map for O(1) lookup instead of O(n) for each author
    const statsMap = new Map(
      authorsWithPosts.map(stat => [stat._id.toString(), stat])
    )

    const authorsWithStats = authors.map(author => {
      const stats = statsMap.get(author._id.toString())
      return {
        ...author,
        _id: author._id.toString(),
        postCount: stats?.postCount || 0,
        latestPost: stats?.latestPost,
        totalViews: stats?.totalViews || 0,
        totalLikes: stats?.totalLikes || 0,
        createdAt: author.createdAt
      }
    })

    // Sort by name as secondary sort (postCount already sorted by DB)
    authorsWithStats.sort((a, b) => {
      if (b.postCount !== a.postCount) {
        return b.postCount - a.postCount
      }
      return a.name.localeCompare(b.name)
    })

    const totalAuthors = authorsWithStats.length
    const totalPosts = authorsWithStats.reduce((sum, author) => sum + author.postCount, 0)
    const totalViews = authorsWithStats.reduce((sum, author) => sum + author.totalViews, 0)
    const adminCount = authorsWithStats.filter(author => author.role === 'admin').length

    // ✅ NEW: JSON-LD Structured Data for SEO
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Multigyan Authors",
      "description": "List of talented authors contributing to Multigyan",
      "numberOfItems": totalAuthors,
      "itemListElement": authorsWithStats.map((author, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Person",
          "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/author/${author.username || author._id}`,
          "name": author.name,
          "url": `${process.env.NEXT_PUBLIC_SITE_URL}/author/${author.username || author._id}`,
          ...(author.profilePictureUrl && { "image": author.profilePictureUrl }),
          ...(author.bio && { "description": author.bio }),
          "jobTitle": author.role === 'admin' ? 'Administrator' : 'Author',
          "worksFor": {
            "@type": "Organization",
            "name": "Multigyan"
          }
        }
      }))
    }

    return (
      <>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Meet Our <span className="title-gradient">Authors</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Discover the talented writers behind Multigyan. Our community of experts
                  shares knowledge, insights, and experiences across various topics.
                </p>
              </div>

              {/* ✅ REFACTORED: Extracted to AuthorStatsGrid component */}
              <AuthorStatsGrid
                totalAuthors={totalAuthors}
                totalPosts={totalPosts}
                totalViews={totalViews}
                adminCount={adminCount}
              />

              {authorsWithStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {authorsWithStats.map((author) => (
                    // ✅ REFACTORED: Extracted to AuthorCard component
                    <AuthorCard key={author._id} author={author} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <UsersIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">No Authors Found</h3>
                        <p className="text-muted-foreground">
                          No authors have published content yet.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mt-16 text-center">
                <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="py-12 px-6">
                    <h2 className="text-2xl font-bold mb-4">
                      Join Our Writing Community
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Have something valuable to share? Join our community of expert writers
                      and start contributing to the knowledge base that helps thousands of readers.
                    </p>
                    <Button size="lg" asChild>
                      <Link href="/register">
                        <PenTool className="mr-2 h-5 w-5" />
                        Become an Author
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error loading authors:', error)

    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Authors</h1>
            <Card>
              <CardContent className="py-16">
                <p className="text-muted-foreground">
                  Unable to load authors at this time. Please try again later.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
}
