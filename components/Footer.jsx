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
  Youtube,
  Sparkles
} from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="relative bg-gradient-to-b from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
      role="contentinfo"
      itemScope
      itemType="https://schema.org/WPFooter"
      aria-label="Site footer"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4 fade-in">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="brand-logo transition-transform group-hover:scale-105">
                  <Image
                    src="/Multigyan_Logo.png"
                    alt="Multigyan Logo"
                    width={140}
                    height={32}
                    className="w-32 h-auto object-contain"
                  />
                </div>
              </Link>
              <p
                className="text-muted-foreground text-sm leading-relaxed"
                itemProp="description"
              >
                A secure, high-performance, and SEO-optimized multi-author blogging platform
                built with modern web technologies.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <a href="mailto:contact@multigyan.in" className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  contact@multigyan.in
                </a>
              </div>

              {/* Social Media Icons with Gradient Backgrounds */}
              <div className="flex flex-wrap gap-2">
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Follow us on Twitter">
                  <Link href="https://twitter.com/Multigyan_in" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Join our Telegram channel">
                  <Link href="https://t.me/multigyanexpert" target="_blank" rel="noopener noreferrer">
                    <Send className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Connect on LinkedIn">
                  <Link href="https://www.linkedin.com/company/multigyan/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400" aria-label="Follow us on Instagram">
                  <Link href="https://instagram.com/multigyan.info" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400" aria-label="Subscribe on YouTube">
                  <Link href="https://youtube.com/@multigyan_in" target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400" aria-label="Join our WhatsApp channel">
                  <Link href="https://whatsapp.com/channel/0029VbBBdkrDOQIQFDv6Rc1v" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '100ms' }}>
              <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Quick Links
              </h3>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  All Posts
                </Link>
                <Link
                  href="/diy"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  DIY Tutorials
                </Link>
                <Link
                  href="/recipe"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Recipes
                </Link>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Categories
                </Link>
                <Link
                  href="/authors"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Authors
                </Link>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '200ms' }}>
              <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Resources
              </h3>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/newsletter"
                  className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <Mail className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Newsletter
                </Link>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Write a Post
                </Link>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Help & Support
                </Link>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact
                </Link>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm hover:translate-x-1 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Terms of Service
                </Link>
              </nav>
            </div>

            {/* Newsletter Section with Glassmorphism */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '300ms' }}>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl">
                <NewsletterSubscribe
                  source="footer"
                  showTitle={true}
                  compact={false}
                  className="space-y-3"
                />
                <Link
                  href="/newsletter"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1 mt-3"
                >
                  <span>Learn more about our newsletter</span>
                  <Mail className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

        {/* Bottom Footer with Gradient */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>© {currentYear} Multigyan. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              <span>for the community</span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/sitemap.xml"
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-105"
              >
                Sitemap
              </Link>
              <Link
                href="/rss.xml"
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-105"
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
