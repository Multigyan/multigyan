import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import NewsletterSubscribe from "@/components/newsletter/NewsletterSubscribe"
import {
  BookOpen,
  Mail,
  Twitter,
  Send,
  Linkedin,
  Heart,
  Send as SendIcon,
  Instagram,
  MessageCircle,
  Youtube
} from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/20 border-t">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4 fade-in">
              <Link href="/" className="flex items-center space-x-3">
                <div className="brand-logo">
                  <Image
                    src="/Multigyan_Logo.png"
                    alt="Multigyan Logo"
                    width={140}
                    height={32}
                    className="w-32 h-auto object-contain"
                  />
                </div>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A secure, high-performance, and SEO-optimized multi-author blogging platform
                built with modern web technologies.
              </p>
              <p className="text-muted-foreground text-sm">
                📧 Contact: <a href="mailto:contact@multigyan.in" className="hover:text-foreground transition-colors">contact@multigyan.in</a>
              </p>
              <div className="flex space-x-2">
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary" aria-label="Follow us on Twitter">
                  <Link href="https://twitter.com/Multigyan_in" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary" aria-label="Join our Telegram channel">
                  <Link href="https://t.me/multigyanexpert" target="_blank" rel="noopener noreferrer">
                    <Send className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary" aria-label="Connect on LinkedIn">
                  <Link href="https://www.linkedin.com/company/multigyan/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary" aria-label="Follow us on Instagram">
                  <Link href="https://instagram.com/multigyan.info" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary" aria-label="Subscribe on YouTube">
                  <Link href="https://youtube.com/@multigyan_in" target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary" aria-label="Join our WhatsApp channel">
                  <Link href="https://whatsapp.com/channel/0029VbBBdkrDOQIQFDv6Rc1v" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '100ms' }}>
              <h3 className="font-bold text-lg text-foreground">Quick Links</h3>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  All Posts
                </Link>
                <Link
                  href="/diy"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  DIY Tutorials
                </Link>
                <Link
                  href="/recipe"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  Recipes
                </Link>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  Categories
                </Link>
                <Link
                  href="/authors"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  Authors
                </Link>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  About Us
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '200ms' }}>
              <h3 className="font-bold text-lg text-foreground">Resources</h3>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/newsletter"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1 flex items-center space-x-1"
                >
                  <Mail className="h-3 w-3" />
                  <span>Newsletter</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  Write a Post
                </Link>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  Help & Support
                </Link>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  Contact
                </Link>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  Terms of Service
                </Link>
              </nav>
            </div>

            {/* Newsletter Section */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '300ms' }}>
              <NewsletterSubscribe
                source="footer"
                showTitle={true}
                compact={false}
                className="space-y-3"
              />
              <Link
                href="/newsletter"
                className="text-xs text-primary hover:underline inline-flex items-center space-x-1"
              >
                <span>Learn more about our newsletter</span>
                <Mail className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>© {currentYear} Multigyan. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current pulse-once" />
              <span>for the community</span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/sitemap.xml"
                className="text-muted-foreground hover:text-foreground transition-all hover:scale-105"
              >
                Sitemap
              </Link>
              <Link
                href="/rss.xml"
                className="text-muted-foreground hover:text-foreground transition-all hover:scale-105"
              >
                RSS Feed
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
