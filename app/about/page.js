import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Target, 
  Heart, 
  TrendingUp, 
  Shield, 
  Globe,
  BookOpen,
  PenTool,
  ArrowRight
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
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="title-gradient">Multigyan</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A secure, high-performance, and SEO-optimized multi-author blogging platform 
            where knowledge multiplies through collaboration.
          </p>
        </div>

        {/* Our Story Section */}
        <section className="mb-20">
          <Card className="blog-card">
            <CardHeader>
              <CardTitle className="text-3xl">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Multigyan was born from a simple yet powerful idea: knowledge grows when shared. 
                In today&#39;s fast-paced digital world, we recognized the need for a platform that 
                not only makes it easy to share insights but also fosters genuine collaboration 
                among writers, thinkers, and creators.
              </p>
              <p>
                Built with modern web technologies including Next.js, MongoDB, and Cloudinary, 
                Multigyan represents the perfect blend of cutting-edge technology and user-friendly 
                design. We believe that great content deserves a great platform, and we&#39;ve worked 
                tirelessly to create exactly that.
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
            Join Our <span className="title-gradient">Community</span>
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
  )
}
