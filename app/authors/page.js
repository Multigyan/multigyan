import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User as UserIcon, 
  PenTool, 
  BookOpen, 
  Calendar, 
  Mail,
  Shield,
  Users as UsersIcon,
  ArrowRight
} from "lucide-react"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Post from "@/models/Post"
import { generateSEOMetadata } from "@/lib/seo"

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
      }
    ])

    const authorIds = authorsWithPosts.map(author => author._id)
    
    const authors = await User.find({ 
      _id: { $in: authorIds },
      isActive: true 
    })
      .select('name email username profilePictureUrl bio role createdAt')
      .lean()

    const authorsWithStats = authors.map(author => {
      const stats = authorsWithPosts.find(stat => 
        stat._id.toString() === author._id.toString()
      )
      return {
        ...author,
        _id: author._id.toString(),
        postCount: stats?.postCount || 0,
        latestPost: stats?.latestPost,
        totalViews: stats?.totalViews || 0,
        totalLikes: stats?.totalLikes || 0,
        createdAt: author.createdAt // ✅ FIX: Already a string with .lean()
      }
    })

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

    return (
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                    <UsersIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{totalAuthors}</div>
                  <div className="text-sm text-muted-foreground">Active Authors</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{totalPosts}</div>
                  <div className="text-sm text-muted-foreground">Published Posts</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mx-auto mb-4">
                    <PenTool className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-lg mx-auto mb-4">
                    <Shield className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{adminCount}</div>
                  <div className="text-sm text-muted-foreground">Admin{adminCount !== 1 ? 's' : ''}</div>
                </CardContent>
              </Card>
            </div>

            {authorsWithStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {authorsWithStats.map((author) => (
                  <Card key={author._id} className="blog-card overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          {author.profilePictureUrl ? (
                            <Image
                              src={author.profilePictureUrl}
                              alt={author.name}
                              width={64}
                              height={64}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-primary" />
                            </div>
                          )}
                          {author.role === 'admin' && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Shield className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-1 truncate">
                            <Link 
                              href={`/author/${author.username || author._id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {author.name}
                            </Link>
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant={author.role === 'admin' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {author.role === 'admin' ? 'Admin' : 'Author'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {author.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {author.bio}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-foreground">
                            {author.postCount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {author.postCount === 1 ? 'Post' : 'Posts'}
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-foreground">
                            {author.totalViews.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {author.totalViews === 1 ? 'View' : 'Views'}
                          </div>
                        </div>
                      </div>

                      {author.latestPost && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Last post: {new Date(author.latestPost).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        asChild
                      >
                        <Link href={`/author/${author.username || author._id}`}>
                          View Profile
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
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
