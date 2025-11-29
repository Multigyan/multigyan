import Link from "next/link"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, PenTool, ArrowRight, TrendingUp, Sparkles, Users, FileText, Layers, Zap, Star, Clock, Eye, Calendar, User, ChevronRight, Mail, Award, Heart, MessageCircle, ShoppingBag } from "lucide-react"
import PostCard from "@/components/blog/PostCard"
import ProductCard from "@/components/store/ProductCard"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatDate, getPostUrl } from "@/lib/helpers"
import HomeSchemas from "@/components/seo/HomeSchemas"
// ✅ OPTIMIZATION: Lazy load NewsletterSubscribe (reduces bundle by ~25KB)
const NewsletterSubscribe = dynamic(() => import("@/components/newsletter/NewsletterSubscribe"), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-muted rounded w-full"></div>
      <div className="h-10 bg-muted rounded w-32 mx-auto"></div>
    </div>
  )
})

// ✅ COST OPTIMIZATION: Revalidate every 60 seconds
export const revalidate = 60

export default async function HomePage() {
  // Fetch data server-side with caching
  const [statsData, latestData, categoriesData, topAuthorsData, featuredProductsData] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/stats/public`, {
      next: { revalidate: 60 }
    }).then(res => res.json()).catch(() => ({ totalPosts: 0, totalAuthors: 0, totalCategories: 0 })),

    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/posts?status=published&limit=7`, {
      next: { revalidate: 60 }
    }).then(res => res.json()).catch(() => ({ posts: [] })),

    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/categories/top?limit=8`, {
      next: { revalidate: 60 }
    }).then(res => res.json()).catch(() => ({ categories: [] })),

    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/authors/top?limit=6`, {
      next: { revalidate: 60 }
    }).then(res => res.json()).catch(() => ({ authors: [] })),

    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/store/products?featured=true&limit=6`, {
      next: { revalidate: 60 }
    }).then(res => res.json()).catch(() => ({ products: [] }))
  ])

  const latestPosts = latestData.posts || []
  const topCategories = categoriesData.categories || []
  const topAuthors = topAuthorsData.authors || []
  const featuredProducts = featuredProductsData.products || []
  const stats = {
    totalPosts: statsData.totalPosts || 0,
    totalAuthors: statsData.totalAuthors || 0,
    totalCategories: statsData.totalCategories || 0
  }

  const featuredPost = latestPosts[0]
  const remainingPosts = latestPosts.slice(1, 7)

  return (
    <>
      <HomeSchemas />

      <div className="min-h-screen">
        {/* 🎨 ENHANCED HERO SECTION */}
        <section className="relative overflow-hidden py-6 sm:py-8 md:py-10 lg:py-12 bg-gradient-to-br from-background via-primary/5 to-background">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Hero Content */}
              <div className="text-center mb-8 md:mb-10">
                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                  Discover Insights.{" "}
                  <br className="hidden sm:block" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60 animate-gradient">
                    Multiply Knowledge.
                  </span>
                </h1>

              </div>

              {/* 🎯 LATEST ARTICLE (MOVED TO TOP) */}
              {featuredPost && (
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <h2 className="text-xl font-bold">Latest Article</h2>
                  </div>

                  <Link href={getPostUrl(featuredPost)} className="block group">
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-background via-primary/5 to-background backdrop-blur-sm relative">
                      {/* Decorative gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 relative z-10">
                        {/* Image */}
                        <div className="relative h-64 md:h-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                          {featuredPost.featuredImageUrl ? (
                            <Image
                              src={featuredPost.featuredImageUrl}
                              alt={featuredPost.featuredImageAlt || featuredPost.title}
                              fill
                              priority={true}
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 flex items-center justify-center">
                              <BookOpen className="h-20 w-20 text-primary/60 group-hover:scale-110 transition-transform" />
                            </div>
                          )}
                          {/* Enhanced gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>

                        {/* Content */}
                        <CardContent className="p-8 flex flex-col justify-center">
                          {/* Animated category badge */}
                          <div className="flex items-center gap-2 mb-4">
                            <Badge
                              className="w-fit px-4 py-1.5 shadow-lg backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all hover:scale-105 animate-in fade-in slide-in-from-left duration-500"
                              style={{ backgroundColor: featuredPost.category?.color }}
                            >
                              {featuredPost.category?.name}
                            </Badge>
                            {featuredPost.isFeatured && (
                              <Badge variant="secondary" className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-700 dark:text-yellow-300 backdrop-blur-sm animate-in fade-in slide-in-from-right duration-500">
                                ⭐ Featured
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-3xl sm:text-4xl font-bold mb-4 line-clamp-2 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text group-hover:from-primary group-hover:to-primary/60 transition-all duration-500">
                            {featuredPost.title}
                          </h3>

                          {featuredPost.excerpt && (
                            <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed text-base group-hover:text-foreground/80 transition-colors">
                              {featuredPost.excerpt}
                            </p>
                          )}

                          {/* Enhanced metadata with icons */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
                            <div className="flex items-center gap-2">
                              {featuredPost.author?.profilePictureUrl ? (
                                <Image
                                  src={featuredPost.author.profilePictureUrl}
                                  alt={featuredPost.author.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-primary" />
                                </div>
                              )}
                              <span className="font-medium">{featuredPost.author?.name}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(featuredPost.publishedAt)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{featuredPost.readingTime} min read</span>
                            </div>

                            {featuredPost.views > 0 && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{featuredPost.views} views</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                              <span>{featuredPost.likeCount || 0}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4 text-blue-500 fill-blue-500" />
                              <span>{featuredPost.commentCount || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 📰 ARTICLES SECTION */}
        {remainingPosts.length > 0 && (
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3 border border-primary/20">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">Latest</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Articles</span>
                  </h2>
                  <p className="text-muted-foreground">
                    Fresh insights and stories from our community
                  </p>
                </div>
                <Button variant="outline" asChild className="hidden md:flex group">
                  <Link href="/blog">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {remainingPosts.map((post, index) => (
                  <div key={post._id} className="animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-10 md:hidden">
                <Button variant="outline" asChild className="w-full sm:w-auto group">
                  <Link href="/blog">
                    View All Articles
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* 📧 NEWSLETTER SIGNUP SECTION */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-primary/20 shadow-2xl">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Stay Updated</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Never Miss an <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Update</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Get the latest articles, insights, and exclusive content delivered straight to your inbox. Join our growing community of readers!
                  </p>

                  <NewsletterSubscribe />

                  <p className="text-xs text-muted-foreground mt-4">
                    🔒 We respect your privacy. Unsubscribe at any time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 🎯 CATEGORIES SHOWCASE */}
        {topCategories.length > 0 && (
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Categories</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  Explore by <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Category</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Discover content organized by topics that interest you
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
                {topCategories.slice(0, 8).map((category, index) => (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug}`}
                    className="group"
                  >
                    <Card className="text-center h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary/30 bg-gradient-to-br from-background to-muted/30">
                      <CardContent className="p-6">
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 group-hover:rotate-12"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <div
                            className="w-10 h-10 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.postCount || 0} article{category.postCount !== 1 ? 's' : ''}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" size="lg" asChild className="group">
                  <Link href="/categories">
                    View All Categories
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* 👥 TOP AUTHORS SPOTLIGHT */}
        {topAuthors.length > 0 && (
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Top Contributors</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  Meet Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Authors</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Talented writers sharing their knowledge and expertise
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                {topAuthors.slice(0, 6).map((author, index) => (
                  <Link
                    key={author._id}
                    href={`/author/${author.username}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary/30 bg-gradient-to-br from-background to-muted/30">
                      <CardContent className="p-6 text-center">
                        {/* Author Avatar */}
                        <div className="relative w-24 h-24 mx-auto mb-4">
                          {author.profilePictureUrl ? (
                            <Image
                              src={author.profilePictureUrl}
                              alt={author.name}
                              fill
                              className="rounded-full object-cover border-4 border-primary/20 group-hover:border-primary/40 transition-all"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center border-4 border-primary/20 group-hover:border-primary/40 transition-all">
                              <User className="h-12 w-12 text-primary/60" />
                            </div>
                          )}
                          <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg">
                            {author.postCount}
                          </div>
                        </div>

                        {/* Author Info */}
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                          {author.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          @{author.username}
                        </p>
                        {author.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {author.bio}
                          </p>
                        )}
                        <Badge variant="secondary" className="text-xs w-fit mx-auto">
                          {author.postCount} article{author.postCount !== 1 ? 's' : ''}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 🛒 FEATURED PRODUCTS SECTION */}
        {featuredProducts.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Featured Products</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  Discover Amazing <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Products</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Handpicked products from top brands, curated just for you
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                {featuredProducts.slice(0, 6).map((product, index) => (
                  <div
                    key={product._id}
                    className="animate-in fade-in slide-in-from-bottom-6 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button size="lg" variant="outline" asChild className="group">
                  <Link href="/store">
                    View All Products
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* 📊 STATISTICS SECTION (MOVED BEFORE CTA) */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Growing <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Community</span>
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <Card className="relative border-2 border-primary/20 hover:border-primary/40 transition-all hover:scale-105 duration-300">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-1">
                      {stats.totalPosts > 0 ? `${stats.totalPosts}+` : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Articles</div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <Card className="relative border-2 border-primary/20 hover:border-primary/40 transition-all hover:scale-105 duration-300">
                  <CardContent className="p-6 text-center">
                    <Layers className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-1">
                      {stats.totalCategories > 0 ? `${stats.totalCategories}+` : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Categories</div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <Card className="relative border-2 border-primary/20 hover:border-primary/40 transition-all hover:scale-105 duration-300">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 mb-1">
                      {stats.totalAuthors > 0 ? `${stats.totalAuthors}+` : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Authors</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 ENHANCED CTA SECTION */}
        <section className="py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 text-center relative">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Join Our Community</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Start Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Journey</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Join our community of writers and readers. Share your knowledge,
                discover new insights, and be part of the conversation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-10 py-7 shadow-2xl hover:shadow-xl transition-all hover:scale-105 group" asChild>
                  <Link href="/register">
                    <PenTool className="mr-2 h-6 w-6 group-hover:-rotate-12 transition-transform" />
                    Start Writing Today
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all hover:scale-105 group" asChild>
                  <Link href="/blog">
                    <BookOpen className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
                    Explore Content
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
