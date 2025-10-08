import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
      <div className="container mx-auto px-4 sm:px-6">
        {/* ✅ IMPROVED: Main Footer Content with better mobile spacing */}
        <div className="py-8 sm:py-10 md:py-12">
          {/* ✅ IMPROVED: Better responsive grid - 1 col mobile, 2 col sm, 4 col md */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 md:gap-8">
            {/* Brand Section */}
            <div className="space-y-4 fade-in sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center space-x-3">
                <div className="brand-logo">
                  <Image
                    src="/Multigyan_Logo.png"
                    alt="Multigyan Logo"
                    width={120}
                    height={32}
                    className="w-28 sm:w-32 h-auto object-contain"
                  />
                </div>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A secure, high-performance, and SEO-optimized multi-author blogging platform 
                built with modern web technologies.
              </p>
              {/* ✅ IMPROVED: Better mobile social icon sizing and spacing */}
              <div className="flex flex-wrap gap-2">
                {/* ✅ IMPROVED: Better touch targets (44x44px) */}
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary h-11 w-11">
                  <Link href="https://twitter.com/Multigyan_in" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary h-11 w-11">
                  <Link href="https://t.me/multigyanexpert" target="_blank" rel="noopener noreferrer">
                    <Send className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary h-11 w-11">
                  <Link href="https://www.linkedin.com/company/multigyan/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary h-11 w-11">
                  <Link href="https://instagram.com/multigyan.info" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary h-11 w-11">
                  <Link href="https://youtube.com/@multigyan_in" target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary h-11 w-11">
                  <Link href="https://whatsapp.com/channel/0029VbBBdkrDOQIQFDv6Rc1v" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '100ms' }}>
              <h3 className="font-semibold text-foreground text-base sm:text-lg">Quick Links</h3>
              <nav className="flex flex-col space-y-2.5">
                {/* ✅ IMPROVED: Better mobile link sizing with better touch targets */}
                <Link 
                  href="/blog" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm sm:text-base hover:translate-x-1 py-1 min-h-[44px] flex items-center"
                >
                  All Posts
                </Link>
                <Link 
                  href="/categories" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm sm:text-base hover:translate-x-1 py-1 min-h-[44px] flex items-center"
                >
                  Categories
                </Link>
                <Link 
                  href="/authors" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm sm:text-base hover:translate-x-1 py-1 min-h-[44px] flex items-center"
                >
                  Authors
                </Link>
                <Link 
                  href="/about" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm sm:text-base hover:translate-x-1 py-1 min-h-[44px] flex items-center"
                >
                  About Us
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '200ms' }}>
              <h3 className="font-semibold text-foreground text-base sm:text-lg">Resources</h3>
              <nav className="flex flex-col space-y-2.5">
                <Link 
                  href="/dashboard" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm sm:text-base hover:translate-x-1 py-1 min-h-[44px] flex items-center"
                >
                  Write a Post
                </Link>
                <Link 
                  href="/help" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm sm:text-base hover:translate-x-1 py-1 min-h-[44px] flex items-center"
                >
                  Help & Support
                </Link>
                <Link 
                  href="/contact" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm sm:text-base hover:translate-x-1 py-1 min-h-[44px] flex items-center"
                >
                  Contact
                </Link>
                <Link 
                  href="/privacy-policy" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm sm:text-base hover:translate-x-1 py-1 min-h-[44px] flex items-center"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms-of-service" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm sm:text-base hover:translate-x-1 py-1 min-h-[44px] flex items-center"
                >
                  Terms of Service
                </Link>
              </nav>
            </div>

            {/* ✅ IMPROVED: Newsletter with better mobile layout */}
            <div className="space-y-4 fade-in sm:col-span-2 lg:col-span-1" style={{ animationDelay: '300ms' }}>
              <h3 className="font-semibold text-foreground text-base sm:text-lg">Stay Updated</h3>
              <p className="text-muted-foreground text-sm">
                Subscribe to our newsletter for the latest posts and updates.
              </p>
              <div className="space-y-3">
                {/* ✅ IMPROVED: Better mobile newsletter input - full width on mobile, flex on larger screens */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="flex-1 transition-all focus:scale-105 h-11 text-base"
                  />
                  <Button size="default" className="transition-all hover:scale-110 h-11 sm:w-11 sm:px-3">
                    <SendIcon className="h-4 w-4" />
                    <span className="sm:hidden ml-2">Subscribe</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* ✅ IMPROVED: Bottom Footer with better mobile layout */}
        <div className="py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-center sm:text-left">
            {/* ✅ IMPROVED: Better mobile copyright text */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 text-xs sm:text-sm text-muted-foreground">
              <span>© {currentYear} Multigyan.</span>
              <span className="flex items-center gap-1">
                Made with
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 fill-current pulse-once" />
                for the community
              </span>
            </div>
            
            {/* ✅ IMPROVED: Better mobile links spacing */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link 
                href="/sitemap.xml" 
                className="text-muted-foreground hover:text-foreground transition-all hover:scale-105 py-2 min-h-[44px] flex items-center"
              >
                Sitemap
              </Link>
              <Link 
                href="/rss.xml" 
                className="text-muted-foreground hover:text-foreground transition-all hover:scale-105 py-2 min-h-[44px] flex items-center"
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
