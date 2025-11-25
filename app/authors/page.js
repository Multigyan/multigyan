import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenTool, Users as UsersIcon } from "lucide-react"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { generateSEOMetadata } from "@/lib/seo"
import AuthorStatsGrid from "@/components/authors/AuthorStatsGrid"
import AuthorCard from "@/components/authors/AuthorCard"
import { getUnifiedStats } from "@/lib/stats"

// Revalidate every 60 seconds for fresh data
export const revalidate = 60

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

    // ✅ Use centralized stats service
    const { stats, authorStats } = await getUnifiedStats()

    // Get author details
    const authorIds = Object.keys(authorStats)
    const authors = await User.find({
      _id: { $in: authorIds },
      isActive: true
    })
      .select('name email username profilePictureUrl bio role createdAt')
      .lean()

    // Combine author data with stats
    const authorsWithStats = authors.map(author => {
      const authorId = author._id.toString()
      const authorStat = authorStats[authorId] || {}
      return {
        ...author,
        _id: authorId,
        postCount: authorStat.postCount || 0,
        latestPost: authorStat.latestPost,
        totalViews: authorStat.totalViews || 0,
        totalLikes: authorStat.totalLikes || 0,
        createdAt: author.createdAt
      }
    })

    // Sort by post count, then by name
    authorsWithStats.sort((a, b) => {
      if (b.postCount !== a.postCount) {
        return b.postCount - a.postCount
      }
      return a.name.localeCompare(b.name)
    })

    const totalAuthors = stats.activeAuthors
    const totalPosts = stats.totalPosts
    const totalViews = stats.totalViews
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
