import React from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  User,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  BookOpen,
  Star,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { formatDate, getPostUrl } from "@/lib/helpers"
// ✅ OPTIMIZATION: Lazy load AdSense (reduces initial bundle, faster TTI)
const AdSense = dynamic(() => import("@/components/AdSense"), {
  loading: () => <div className="h-24 bg-muted animate-pulse rounded" />
})
import SearchForm from "@/components/blog/SearchForm"
// ✅ OPTIMIZATION: Lazy load NewsletterSubscribe (reduces bundle by ~25KB)
const NewsletterSubscribe = dynamic(() => import("@/components/newsletter/NewsletterSubscribe"), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-muted rounded w-full"></div>
      <div className="h-10 bg-muted rounded w-32 mx-auto"></div>
    </div>
  )
})
import StructuredData, { generateBreadcrumbSchema, generateItemListSchema, generateWebSiteSchema } from "@/components/seo/StructuredData"
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import { BLOG_CONFIG } from "@/lib/constants"
import Pagination from "@/components/blog/Pagination"
import EmptyState from "@/components/blog/EmptyState"
import PopularPosts from "@/components/blog/PopularPosts"

// ✅ SEO: Comprehensive metadata for blog listing page
export const metadata = {
  title: 'Blog - Latest Articles & Insights',
  description: 'Explore latest articles on personal finance, health, technology, and current affairs. Join thousands discovering expert insights and practical guides.',
  keywords: ['blog', 'articles', 'insights', 'personal finance', 'health', 'technology', 'DIY', 'recipes', 'current affairs'],
  openGraph: {
    title: 'Blog - Latest Articles & Insights',
    description: 'Explore our latest articles on personal finance, health, technology, current affairs, and more. Join thousands of readers discovering expert insights.',
    url: 'https://www.multigyan.in/blog',
    type: 'website',
    images: [
      {
        url: '/Multigyan_Logo_bg.png',
        width: 512,
        height: 512,
        alt: 'Multigyan Blog',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Latest Articles & Insights',
    description: 'Explore our latest articles on personal finance, health, technology, and more.',
    images: ['/Multigyan_Logo_bg.png'],
  },
  alternates: {
    canonical: 'https://www.multigyan.in/blog',
  }
}

// ✅ COST OPTIMIZATION: Revalidate every 5 minutes (300 seconds)
export const revalidate = 300

export default async function BlogPage({ searchParams }) {
  // ✅ FIX: Await searchParams before accessing properties (Next.js 15+ requirement)
  const resolvedParams = await searchParams

  // Get search, pagination, and sort params
  const page = parseInt(resolvedParams.page) || 1
  const search = resolvedParams.search || ''
  const sort = resolvedParams.sort || 'latest'

  // Build API URL with sort parameter (11 posts per page)
  const postsPerPage = 11
  let apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/posts?status=published&excludeRecipes=true&page=${page}&limit=${postsPerPage}`

  if (search) {
    apiUrl += `&search=${encodeURIComponent(search)}`
  }

  // Add sort parameter
  if (sort === 'popular') {
    apiUrl += '&sortBy=views&sortOrder=desc'
  } else if (sort === 'trending') {
    apiUrl += '&sortBy=likes&sortOrder=desc'
  } else {
    apiUrl += '&sortBy=publishedAt&sortOrder=desc'
  }

  // ✅ COST OPTIMIZATION: Fetch data server-side with caching
  const [postsData, featuredData, categoriesData] = await Promise.all([
    fetch(apiUrl, {
      next: { revalidate: BLOG_CONFIG.POSTS_REVALIDATE }
    }).then(res => res.json()).catch(() => ({ posts: [], pagination: null })),

    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/posts?status=published&featured=true&limit=${BLOG_CONFIG.FEATURED_POSTS_COUNT}`, {
      next: { revalidate: BLOG_CONFIG.FEATURED_REVALIDATE }
    }).then(res => res.json()).catch(() => ({ posts: [] })),

    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/categories?includeCounts=true`, {
      next: { revalidate: BLOG_CONFIG.CATEGORIES_REVALIDATE }
    }).then(res => res.json()).catch(() => ({ categories: [] }))
  ])

  const posts = postsData.posts || []
  const pagination = postsData.pagination
  const featuredPosts = featuredData.posts || []
  const categories = categoriesData.categories || []

  // ✅ SEO: Generate structured data schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' }
  ])

  const itemListSchema = generateItemListSchema(posts, page)
  const websiteSchema = generateWebSiteSchema()

  return (
    <div className="min-h-screen">
      {/* ✅ SEO: Structured Data */}
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={itemListSchema} />
      <StructuredData data={websiteSchema} />

      {/* 🎨 ENHANCED HERO SECTION */}
      <section id="main-content" className="relative overflow-hidden py-6 sm:py-8 md:py-10 lg:py-12 bg-gradient-to-br from-background via-primary/5 to-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumbs */}
            <Breadcrumbs
              items={[
                { name: 'Blog', url: '/blog' }
              ]}
              className="mb-6 fade-in"
            />

            {/* Hero Content */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Blog</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                {search ? 'Search Results' : 'Latest'}{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60 animate-gradient">
                  Articles
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                {search
                  ? `Found ${pagination?.total || 0} articles for "${search}"`
                  : 'Discover expert insights, practical guides, and trending stories'}
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-450">
                <SearchForm initialSearch={search} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⭐ REDESIGNED FEATURED STORIES SECTION */}
      {featuredPosts.length > 0 && !search && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3 border border-primary/20">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Featured</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Top Stories</span>
                </h2>
                <p className="text-muted-foreground">
                  Handpicked articles you shouldn&#39;t miss
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.slice(0, 3).map((post, index) => (
                <Link key={post._id} href={getPostUrl(post)} className="block group">
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-background to-primary/5 h-full">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {post.featuredImageUrl ? (
                        <Image
                          src={post.featuredImageUrl}
                          alt={post.featuredImageAlt || post.title}
                          fill
                          priority={index < 3}
                          loading={index < 3 ? 'eager' : 'lazy'}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-primary/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <CardContent className="p-6">
                      <Badge
                        className="w-fit mb-3"
                        style={{ backgroundColor: post.category?.color }}
                      >
                        {post.category?.name}
                      </Badge>

                      <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {post.author?.profilePictureUrl ? (
                            <Image
                              src={post.author.profilePictureUrl}
                              alt={post.author.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                          )}
                          <span className="font-medium">{post.author?.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readingTime} min read</span>
                        </div>

                        {post.views > 0 && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{post.views}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 📰 MAIN CONTENT SECTION */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Posts Area */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    All <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Articles</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {pagination?.total || 0} articles available
                  </p>
                </div>
              </div>

              {/* Posts Grid */}
              {posts.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title={search ? "No articles found" : "No articles yet"}
                  description={search ? `No results for "${search}"` : "Check back soon"}
                  action={search && <Button asChild><Link href="/blog">Clear Search</Link></Button>}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    {posts.map((post, index) => {
                      // Show 2 stacked ads after Post 3 (index 2)
                      const showAdsAfter = index === 2

                      return (
                        <React.Fragment key={post._id}>
                          <div>
                            {/* Blog Post Card */}
                            <Link href={getPostUrl(post)} className="block">
                              <Card className="blog-card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group h-full">
                                <div className="relative h-48 overflow-hidden">
                                  {post.featuredImageUrl ? (
                                    <Image
                                      src={post.featuredImageUrl}
                                      alt={post.featuredImageAlt || post.title}
                                      fill
                                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                                      <BookOpen className="h-12 w-12 text-primary/60" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                                </div>

                                <CardContent className="p-6 pt-0 mt-6">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge style={{ backgroundColor: post.category?.color }}>
                                      {post.category?.name}
                                    </Badge>
                                  </div>

                                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                    {post.title}
                                  </h3>

                                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {post.excerpt}
                                  </p>

                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {post.author?.profilePictureUrl ? (
                                          <Image
                                            src={post.author.profilePictureUrl}
                                            alt={post.author.name}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                            <User className="h-3 w-3 text-primary" />
                                          </div>
                                        )}
                                        <span className="text-sm text-muted-foreground truncate">
                                          {post.author?.name}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span className="hidden sm:inline">{formatDate(post.publishedAt)}</span>
                                        <span className="sm:hidden">{formatDate(post.publishedAt).split(',')[0]}</span>
                                      </div>
                                    </div>

                                    <div className="border-t" />

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          {post.readingTime} min
                                        </span>
                                        {post.views > 0 && (
                                          <span className="flex items-center gap-1 text-muted-foreground">
                                            <Eye className="h-3 w-3" />
                                            {post.views}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 group-hover:bg-red-100">
                                          <Heart className="h-3 w-3 fill-current" />
                                          <span className="text-xs font-semibold">{post.likeCount ?? post.likes?.length ?? 0}</span>
                                        </span>
                                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                                          <MessageCircle className="h-3 w-3" />
                                          <span className="text-xs font-semibold">{post.commentCount ?? post.comments?.filter(c => c.isApproved).length ?? 0}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          </div>

                          {/* 2 Stacked Ads - After 1st post only */}
                          {showAdsAfter && (
                            <div key="ads-stack" className="space-y-6">
                              {/* Ad 1 */}
                              <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                  <div className="hidden sm:block">
                                    <AdSense
                                      adSlot="9582096729"
                                      adFormat="fluid"
                                      adLayout="in-article"
                                      adStyle={{ display: 'block', minHeight: '210px' }}
                                    />
                                  </div>
                                  <div className="block sm:hidden">
                                    <AdSense
                                      adSlot="3893945332"
                                      adFormat="fluid"
                                      adLayout="in-article"
                                      adStyle={{ display: 'block', minHeight: '210px' }}
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Ad 2 */}
                              <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                  <div className="hidden sm:block">
                                    <AdSense
                                      adSlot="9582096729"
                                      adFormat="fluid"
                                      adLayout="in-article"
                                      adStyle={{ display: 'block', minHeight: '210px' }}
                                    />
                                  </div>
                                  <div className="block sm:hidden">
                                    <AdSense
                                      adSlot="3893945332"
                                      adFormat="fluid"
                                      adLayout="in-article"
                                      adStyle={{ display: 'block', minHeight: '210px' }}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>

                  {/* Enhanced Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <Pagination
                      currentPage={page}
                      totalPages={pagination.pages}
                      baseUrl="/blog"
                      searchParams={{ search, sort }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <Card>
                <CardContent className="p-4">
                  {/* Desktop Ad */}
                  <div className="hidden sm:block">
                    <AdSense
                      adSlot="2469183021"
                      adFormat="fluid"
                      adLayout="in-article"
                      adStyle={{ display: 'block', minHeight: '250px' }}
                    />
                  </div>
                  {/* Mobile Ad - Using specified slot */}
                  <div className="block sm:hidden">
                    <AdSense
                      adSlot="9146272012"
                      adFormat="fluid"
                      adLayout="in-article"
                      adStyle={{ display: 'block', minHeight: '250px' }}
                    />
                  </div>
                </CardContent>
              </Card>
              {/* Popular Posts */}
              <PopularPosts limit={5} />


              {/* Categories */}
              {categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Categories
                    </CardTitle>
                    <CardDescription>
                      Browse articles by topic
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.slice(0, BLOG_CONFIG.SIDEBAR_CATEGORIES_COUNT).map((category) => (
                        <Link
                          key={category._id}
                          href={`/category/${category.slug}`}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">{category.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {category.postCount}
                          </Badge>
                        </Link>
                      ))}

                      {categories.length > BLOG_CONFIG.SIDEBAR_CATEGORIES_COUNT && (
                        <Link
                          href="/categories"
                          className="flex items-center justify-center p-2 text-sm text-primary hover:text-primary/80 hover:bg-accent rounded-md transition-all font-medium"
                        >
                          View All Categories <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Newsletter */}
              <Card>
                <CardHeader>
                  <CardTitle>Stay Updated</CardTitle>
                  <CardDescription>
                    Get the latest articles delivered to your inbox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NewsletterSubscribe
                    source="blog-sidebar"
                    showTitle={false}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
