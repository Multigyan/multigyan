"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  List, 
  X, 
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowUp
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Table of Contents Component
 * 
 * Features:
 * - Auto-generates from H2 and H3 headings in the content
 * - Sticky sidebar view (desktop)
 * - Floating button with drawer (mobile)
 * - Active section highlighting based on scroll position
 * - Smooth scroll to sections
 * - Collapsible sections
 * - Reading progress indicator
 * 
 * Note: Global Back to Top button is handled by BackToTop component in layout
 */

export default function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)

  // Extract headings from the rendered content
  useEffect(() => {
    // Wait a bit for content to render
    const timer = setTimeout(() => {
      const articleElement = document.querySelector('.blog-content')
      if (!articleElement) return

      const headingElements = articleElement.querySelectorAll('h2, h3')
      const extractedHeadings = []

      headingElements.forEach((heading, index) => {
        // Create or use existing ID
        let id = heading.id
        if (!id) {
          // Create a URL-friendly ID from the text content
          const text = heading.textContent
          id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
          
          // Ensure uniqueness
          let finalId = id
          let counter = 1
          while (document.getElementById(finalId)) {
            finalId = `${id}-${counter}`
            counter++
          }
          
          heading.id = finalId
          id = finalId
        }

        const text = heading.textContent
        const level = heading.tagName.toLowerCase()

        extractedHeadings.push({ id, text, level })
      })

      setHeadings(extractedHeadings)
    }, 300) // Increased timeout for content to fully render

    return () => clearTimeout(timer)
  }, [content])

  // Track active section and reading progress
  useEffect(() => {
    const handleScroll = () => {
      // Calculate reading progress
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrolled = window.scrollY
      const progress = documentHeight > 0 ? Math.min((scrolled / documentHeight) * 100, 100) : 0
      setReadingProgress(progress)

      // Find active heading
      if (headings.length === 0) return

      const headingElements = headings
        .map(h => document.getElementById(h.id))
        .filter(Boolean)
      
      let currentActiveId = ""
      
      // Get the navbar height to account for offset
      const navbarHeight = 100 // Adjust this to match your navbar height
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i]
        const rect = element.getBoundingClientRect()
        
        // Consider a heading active if it's within viewport considering navbar
        if (rect.top <= navbarHeight + 50) {
          currentActiveId = element.id
          break
        }
      }

      setActiveId(currentActiveId)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  // Smooth scroll to section - FIXED VERSION
  const scrollToHeading = (id) => {
    const element = document.getElementById(id)
    if (element) {
      // Get the navbar height (adjust this value to match your navbar)
      const navbarHeight = 100
      
      // Calculate the position
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight
      
      // Smooth scroll
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      
      // Close mobile drawer
      setIsOpen(false)
      
      // Update active state immediately for better UX
      setActiveId(id)
    }
  }

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    setIsOpen(false)
  }

  if (headings.length === 0) {
    return null // Don't show TOC if no headings
  }

  // Desktop Sidebar View
  const DesktopTOC = () => (
    <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto custom-scrollbar">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Table of Contents
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
              aria-label={isCollapsed ? "Expand TOC" : "Collapse TOC"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Reading Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Reading Progress</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 rounded-full"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="pt-0 pb-4">
            <nav className="space-y-1">
              {headings.map((heading, index) => (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    "w-full text-left text-sm py-2 px-3 rounded-md transition-all hover:bg-muted group",
                    heading.level === 'h3' && "pl-6 text-xs",
                    activeId === heading.id && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                  )}
                  aria-label={`Go to section: ${heading.text}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "text-muted-foreground font-mono text-xs mt-0.5 flex-shrink-0",
                      activeId === heading.id && "text-primary font-semibold"
                    )}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="line-clamp-2 leading-relaxed">{heading.text}</span>
                  </div>
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{headings.length} sections</span>
                <Badge variant="outline" className="text-xs">
                  {Math.ceil(headings.length * 0.5)} min
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )

  // Mobile Floating Button & Drawer
  const MobileTOC = () => (
    <>
      {/* Floating TOC Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full shadow-lg h-14 w-14 p-0 hover:scale-110 transition-transform"
            aria-label="Open Table of Contents"
          >
            <List className="h-6 w-6" />
          </Button>
          
          {/* Reading Progress Circle */}
          <svg className="absolute inset-0 -z-10 pointer-events-none" width="60" height="60" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="27"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary/20"
            />
            <circle
              cx="30"
              cy="30"
              r="27"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 27}`}
              strokeDashoffset={`${2 * Math.PI * 27 * (1 - readingProgress / 100)}`}
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

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 z-50 animate-in fade-in backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Table of Contents
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {headings.length} sections • {Math.round(readingProgress)}% completed
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close Table of Contents"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="px-4 py-3 bg-muted/30">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>

            {/* TOC List */}
            <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-4 custom-scrollbar">
              <nav className="space-y-2">
                {headings.map((heading, index) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "w-full text-left text-sm py-3 px-4 rounded-lg transition-all",
                      heading.level === 'h3' && "pl-10 text-xs",
                      activeId === heading.id 
                        ? "bg-primary text-primary-foreground font-medium shadow-md scale-[1.02]" 
                        : "hover:bg-muted active:scale-[0.98]"
                    )}
                    aria-label={`Go to section: ${heading.text}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={cn(
                        "font-mono text-xs mt-0.5 flex-shrink-0",
                        activeId === heading.id ? "font-bold" : "text-muted-foreground"
                      )}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="line-clamp-2">{heading.text}</span>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Back to Top in Mobile Drawer */}
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={scrollToTop}
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Back to Top
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )

  return (
    <>
      <DesktopTOC />
      <MobileTOC />
    </>
  )
}
