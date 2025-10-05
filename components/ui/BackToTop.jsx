"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Global Back to Top Button
 * 
 * Features:
 * - Appears on all pages after scrolling 300px
 * - Smooth scroll animation to top
 * - Reading progress indicator (ring animation)
 * - Responsive positioning (desktop: bottom-left, mobile: bottom-right)
 * - Bounce animation on hover
 * - Scale effect on interaction
 * - Accessible with keyboard navigation
 * 
 * Usage:
 * Add to root layout for global availability
 */

export default function BackToTop() {
  const [showButton, setShowButton] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleScroll = () => {
      const scrolled = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight

      // Show button after scrolling 300px
      setShowButton(scrolled > 300)

      // Calculate scroll progress (0-100%)
      const progress = documentHeight > 0 ? Math.min((scrolled / documentHeight) * 100, 100) : 0
      setScrollProgress(progress)
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial call
    handleScroll()

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Don't render until mounted (prevent hydration issues)
  if (!mounted) return null

  return (
    <>
      {/* Desktop Back to Top Button (Bottom-Left) */}
      <div
        className={cn(
          "hidden lg:block fixed bottom-8 left-8 z-40 transition-all duration-300",
          showButton 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="relative">
          <Button
            onClick={scrollToTop}
            size="lg"
            className="rounded-full shadow-2xl h-14 w-14 p-0 hover:scale-110 transition-all group"
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp className="h-6 w-6 group-hover:animate-bounce" />
          </Button>
          
          {/* Progress Ring */}
          <svg 
            className="absolute inset-0 -z-10 pointer-events-none" 
            width="60" 
            height="60" 
            viewBox="0 0 60 60"
          >
            {/* Background circle */}
            <circle
              cx="30"
              cy="30"
              r="27"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary/20"
            />
            {/* Progress circle */}
            <circle
              cx="30"
              cy="30"
              r="27"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 27}`}
              strokeDashoffset={`${2 * Math.PI * 27 * (1 - scrollProgress / 100)}`}
              className="text-primary transition-all duration-300"
              style={{ 
                transform: 'rotate(-90deg)', 
                transformOrigin: '50% 50%',
                filter: 'drop-shadow(0 0 4px currentColor)'
              }}
            />
          </svg>
        </div>
      </div>

      {/* Mobile Back to Top Button (Bottom-Right, stacked with TOC) */}
      <div
        className={cn(
          "lg:hidden fixed bottom-24 right-6 z-40 transition-all duration-300",
          showButton 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <Button
          onClick={scrollToTop}
          size="lg"
          variant="secondary"
          className="rounded-full shadow-2xl h-12 w-12 p-0 hover:scale-110 transition-all group"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="h-5 w-5 group-hover:animate-bounce" />
        </Button>
      </div>
    </>
  )
}
