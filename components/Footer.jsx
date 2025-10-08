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
                    className="w-30 h-30 object-contain"
                  />
                </div>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A secure, high-performance, and SEO-optimized multi-author blogging platform 
                built with modern web technologies.
              </p>
              <div className="flex space-x-2">
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary">
                  <Link href="https://twitter.com/Multigyan_in" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary">
                  <Link href="https://t.me/multigyanexpert" target="_blank" rel="noopener noreferrer">
                    <Send className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary">
                  <Link href="https://www.linkedin.com/company/multigyan/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary">
                  <Link href="https://instagram.com/multigyan.info" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary">
                  <Link href="https://youtube.com/@multigyan_in" target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" asChild className="transition-all hover:scale-110 hover:text-primary">
                  <Link href="https://whatsapp.com/channel/0029VbBBdkrDOQIQFDv6Rc1v" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '100ms' }}>
              <h3 className="font-semibold text-foreground">Quick Links</h3>
              <nav className="flex flex-col space-y-2">
                <Link 
                  href="/blog" 
                  className="text-muted-foreground hover:text-foreground transition-all text-sm hover:translate-x-1"
                >
                  All Posts
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
              <h3 className="font-semibold text-foreground">Resources</h3>
              <nav className="flex flex-col space-y-2">
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

            {/* Newsletter */}
            <div className="space-y-4 fade-in" style={{ animationDelay: '300ms' }}>
              <h3 className="font-semibold text-foreground">Stay Updated</h3>
              <p className="text-muted-foreground text-sm">
                Subscribe to our newsletter for the latest posts and updates.
              </p>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="flex-1 transition-all focus:scale-105"
                  />
                  <Button size="icon" className="transition-all hover:scale-110">
                    <SendIcon className="h-4 w-4" />
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
