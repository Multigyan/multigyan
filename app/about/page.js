import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Target,
  Heart,
  TrendingUp,
  Shield,
  Globe,
  BookOpen,
  PenTool,
  ArrowRight,
  Search,
  Zap,
  Sparkles
} from 'lucide-react'

export const metadata = {
  title: 'About Us',
  description: 'Learn about Multigyan - A secure, high-performance multi-author blogging platform built for modern content creators. Discover our mission, values, and community.',
  keywords: ['about multigyan', 'blogging platform', 'multi-author blog', 'content creation', 'our mission', 'our story'],
}

// Static generation for performance
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/3 dark:to-purple-500/3 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          {/* Welcome to Multigyan - Hero Section */}
          <section className="text-center max-w-5xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Multi-Author Blogging Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Welcome to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Multigyan
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto">
              Discover insightful articles, expert perspectives, and engaging stories from our
              community of talented writers. Where knowledge multiplies through collaboration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" asChild>
                <Link href="/blog">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Articles
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">
                  <PenTool className="mr-2 h-5 w-5" />
                  Start Writing
                </Link>
              </Button>
            </div>
          </section>

          {/* Why Choose Multigyan Section */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Multigyan</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join a thriving community of readers and writers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Users,
                  title: "Multi-Author Platform",
                  description: "Collaborate with talented writers across blog posts, DIY tutorials, and recipes. Each author brings unique expertise and perspectives.",
                  gradient: "from-blue-500 to-blue-600"
                },
                {
                  icon: Shield,
                  title: "Quality Content",
                  description: "Every article goes through our review process to ensure high-quality, valuable content for our readers.",
                  gradient: "from-green-500 to-green-600"
                },
                {
                  icon: Search,
                  title: "Smart Filtering",
                  description: "Find content easily with advanced filters for categories, difficulty levels, cuisines, dietary preferences, and more.",
                  gradient: "from-blue-500 to-blue-600"
                },
                {
                  icon: PenTool,
                  title: "Share Your Voice",
                  description: "Become an author and share your knowledge with our growing community of engaged readers.",
                  gradient: "from-purple-500 to-purple-600"
                },
                {
                  icon: Zap,
                  title: "Diverse Content",
                  description: "From tech articles to DIY projects and delicious recipes - discover blog posts, step-by-step tutorials, and cooking guides all in one place.",
                  gradient: "from-orange-500 to-red-600"
                },
                {
                  icon: BookOpen,
                  title: "Free Access",
                  description: "All our content is freely accessible to everyone. No paywalls, no subscriptions required.",
                  gradient: "from-pink-500 to-rose-600"
                }
              ].map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <Card key={index} className="blog-card hover:shadow-lg transition-all border">
                    <CardHeader>
                      <div className={`w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{benefit.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed mt-3">
                        {benefit.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Our Story Section */}
          <section className="mb-20">
            <Card className="blog-card">
              <CardHeader>
                <CardTitle className="text-3xl">Our Story</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none">
                <p>
                  Multigyan was born from a simple yet powerful idea: knowledge grows when shared.
                  We created a platform where writers can share blog articles, DIY enthusiasts can
                  teach creative projects, and home cooks can share their favorite recipes - all in
                  one collaborative space.
                </p>
                <p>
                  Built with Next.js 15, MongoDB, and modern web technologies, Multigyan combines
                  powerful features like real-time analytics, advanced filtering, dark mode support,
                  and a rich TipTap editor. We believe great content deserves a great platform, and
                  we&#39;ve built exactly that.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Our Mission & Vision */}
          <section className="grid md:grid-cols-2 gap-8 mb-20">
            <Card className="blog-card">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To empower writers, makers, and creators with a powerful platform for sharing blog posts,
                  DIY tutorials, and recipes. We provide the tools and community support needed to create,
                  publish, and grow your audience across multiple content types.
                </p>
              </CardContent>
            </Card>

            <Card className="blog-card">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To become the leading multi-format content platform where creators can seamlessly share
                  articles, tutorials, and recipes. We envision a community where knowledge, creativity,
                  and culinary arts come together to inspire and educate.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Core Values */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="blog-card text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Community First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We put our users and their needs at the heart of everything we build.
                  </p>
                </CardContent>
              </Card>

              <Card className="blog-card text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Security & Privacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your data is protected with industry-standard security measures.
                  </p>
                </CardContent>
              </Card>

              <Card className="blog-card text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Innovation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We continuously improve and adapt to serve you better.
                  </p>
                </CardContent>
              </Card>

              <Card className="blog-card text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Quality Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We promote high-quality, valuable content that educates and inspires.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* What Makes Us Different */}
          <section className="mb-20">
            <Card className="blog-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4">What Makes Us Different</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">TipTap Editor</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced rich text editor with formatting, images, code blocks, and real-time preview
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Role-Based Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Author and admin roles with up to 4 admins, content approval workflow, and analytics dashboard
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <PenTool className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Smart Features</h3>
                    <p className="text-sm text-muted-foreground">
                      Flexible post creation with Quick Post (6 fields) or Full Post (30+ fields), Wizard Mode for guided flow, auto-save, draft management, live preview, dark mode, comment system, and Cloudinary image hosting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">
              Join Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Community</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you&#39;re a writer, reader, or both, there&#39;s a place for you at Multigyan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Writing Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/blog">
                  Explore Articles
                  <BookOpen className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
