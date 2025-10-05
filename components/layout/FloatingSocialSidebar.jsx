"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  MessageCircle, 
  Send, 
  Instagram, 
  Youtube, 
  Linkedin,
  Mail,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Floating Social Sidebar
 * 
 * A fixed sidebar on the right side of the screen with social media links
 * and contact options. Includes collapse/expand functionality.
 * 
 * POSITIONING:
 * - Desktop: Right side, middle of screen (sticky)
 * - Mobile: Bottom-left corner (to avoid collision with TOC button)
 */

const socialLinks = [
  {
    name: "Contact Us",
    icon: Mail,
    href: "/contact",
    color: "bg-blue-600 hover:bg-blue-700",
    external: false
  },
  {
    name: "Telegram",
    icon: Send,
    href: "https://t.me/multigyan",
    color: "bg-[#0088cc] hover:bg-[#006699]",
    external: true
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/multigyan",
    color: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90",
    external: true
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://youtube.com/@multigyan",
    color: "bg-red-600 hover:bg-red-700",
    external: true
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com/company/multigyan",
    color: "bg-[#0077b5] hover:bg-[#006399]",
    external: true
  }
]

export default function FloatingSocialSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering interactive parts after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isVisible) {
    return (
      // Reopen Button (when closed) - Desktop only
      <button
        onClick={() => setIsVisible(true)}
        className="hidden lg:flex fixed top-1/2 -translate-y-1/2 right-0 bg-primary text-primary-foreground w-8 h-16 items-center justify-center rounded-l-lg shadow-lg hover:bg-primary/90 transition-all z-40"
        aria-label="Show social links"
        title="Show social links"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed top-1/2 -translate-y-1/2 right-0 z-40 hidden lg:block">
        <div className="relative">
          {/* Social Links */}
          <div className={cn(
            "flex flex-col gap-0 shadow-2xl rounded-l-xl overflow-hidden transition-all duration-300",
            isCollapsed ? "translate-x-full" : "translate-x-0"
          )}>
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="group relative"
                title={link.name}
              >
                <div className={cn(
                  "flex items-center justify-center w-14 h-14 text-white transition-all duration-200",
                  link.color
                )}>
                  <link.icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 bg-primary text-primary-foreground w-8 h-12 flex items-center justify-center rounded-l-lg shadow-lg hover:bg-primary/90 transition-all duration-300",
              isCollapsed ? "right-0" : "-left-8"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>

          {/* Close Button - Only visible when expanded */}
          {!isCollapsed && (
            <button
              onClick={() => setIsVisible(false)}
              className="absolute -left-8 bottom-0 bg-gray-800 text-white w-8 h-10 flex items-center justify-center rounded-l-lg shadow-lg hover:bg-gray-700 transition-all"
              aria-label="Close sidebar"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Floating Button - MOVED TO BOTTOM-LEFT */}
      {mounted && (
        <div className="lg:hidden fixed bottom-6 left-6 z-40">
          <div className="relative">
            {/* Main Social Button */}
            <Button
              size="lg"
              className="rounded-full shadow-lg h-14 w-14 p-0 hover:scale-110 transition-transform"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close social menu" : "Open social menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MessageCircle className="h-6 w-6" />
              )}
            </Button>

            {/* Backdrop - Use CSS instead of conditional rendering */}
            <div 
              className={cn(
                "fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 transition-opacity duration-200",
                mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              )}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu - Use CSS instead of conditional rendering */}
            <div className={cn(
              "absolute bottom-16 left-0 flex flex-col gap-2 bg-background border rounded-xl shadow-2xl p-3 transition-all duration-200 origin-bottom-left",
              mobileMenuOpen 
                ? "opacity-100 scale-100 pointer-events-auto" 
                : "opacity-0 scale-95 pointer-events-none"
            )}>
              <div className="text-xs font-semibold text-muted-foreground px-2 mb-1">
                Connect with us
              </div>
              {socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-3 hover:bg-muted rounded-lg transition-all p-2"
                  onClick={() => setMobileMenuOpen(false)}
                  title={link.name}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 text-white rounded-lg transition-all flex-shrink-0",
                    link.color
                  )}>
                    <link.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
