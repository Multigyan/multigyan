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
  title: 'About Us | Multigyan',
  description: 'Learn about Multigyan - A secure, high-performance multi-author blogging platform built for modern content creators.',
  keywords: ['about multigyan', 'blogging platform', 'multi-author blog', 'content creation'],
}

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12">
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
                title: "Diverse Perspectives",
                description: "Read from multiple authors with unique viewpoints and expertise across various topics and industries.",
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
                title: "Easy Discovery",
                description: "Find exactly what you're looking for with organized categories, tags, and powerful search functionality.",
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
                title: "Always Fresh",
                description: "New articles published regularly across all categories, so there's always something new to discover.",
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
                In today's fast-paced digital world, we recognized the need for a platform that 
                not only makes it easy to share insights but also fosters genuine collaboration 
                among writers, thinkers, and creators.
              </p>
              <p>
                Built with modern web technologies, Multigyan represents the perfect blend of 
                cutting-edge technology and user-friendly design. We believe that great content 
                deserves a great platform, and we've worked tirelessly to create exactly that.
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
                To empower writers and content creators with a powerful, secure, and intuitive 
                platform that makes sharing knowledge effortless. We strive to build a community 
                where ideas flourish and collaboration drives innovation.
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
                To become the go-to platform for collaborative content creation, where writers 
                from around the world can connect, share, and grow together. We envision a future 
                where quality content is accessible to everyone, everywhere.
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
                  <h3 className="font-semibold text-lg mb-2">Rich Editor</h3>
                  <p className="text-sm text-muted-foreground">
                    Powerful TipTap editor with formatting, images, and code blocks
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Multi-Author</h3>
                  <p className="text-sm text-muted-foreground">
                    Role-based access with author and admin permissions
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
                    <PenTool className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Easy Publishing</h3>
                  <p className="text-sm text-muted-foreground">
                    Streamlined workflow from draft to published content
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
            Whether you're a writer, reader, or both, there's a place for you at Multigyan.
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
  )
}
