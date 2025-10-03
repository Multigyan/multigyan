"use client"

import { useState } from "react"
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

  if (!isVisible) return null

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

      {/* Mobile Floating Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <div className="relative">
          <Button
            size="lg"
            className="rounded-full shadow-lg h-14 w-14 p-0"
            onClick={() => {
              const menu = document.getElementById('mobile-social-menu')
              if (menu) {
                menu.classList.toggle('hidden')
              }
            }}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>

          {/* Mobile Menu - Icon only */}
          <div
            id="mobile-social-menu"
            className="hidden absolute bottom-16 right-0 flex flex-col gap-1 bg-background border rounded-lg shadow-xl p-2"
          >
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="group"
                title={link.name}
              >
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 text-white rounded-lg transition-all",
                  link.color
                )}>
                  <link.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Reopen Button (when closed) */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="hidden lg:flex fixed top-1/2 -translate-y-1/2 right-0 bg-primary text-primary-foreground w-8 h-16 items-center justify-center rounded-l-lg shadow-lg hover:bg-primary/90 transition-all z-40"
          aria-label="Show social links"
          title="Show social links"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
    </>
  )
}
