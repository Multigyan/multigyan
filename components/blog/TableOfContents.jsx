"use client"

import { useState, useEffect, useMemo } from "react"
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

export default function TableOfContents({ content, readingTime, showMobileButton = true }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)

  // Extract headings
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 10
    let timeoutId

    const extractHeadings = () => {
      attempts++

      const articleElement = document.querySelector('.blog-content')

      if (!articleElement) {
        if (attempts < maxAttempts) {
          timeoutId = setTimeout(extractHeadings, 300)
        }
        return
      }

      const headingElements = articleElement.querySelectorAll('h2, h3')

      if (headingElements.length === 0 && attempts < maxAttempts) {
        timeoutId = setTimeout(extractHeadings, 300)
        return
      }

      const extractedHeadings = []

      headingElements.forEach((heading) => {
        const text = heading.textContent.trim()
        if (!text) return

        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')

        if (!id) return

        let finalId = id
        let counter = 1
        while (extractedHeadings.find(h => h.id === finalId)) {
          finalId = `${id}-${counter}`
          counter++
        }

        heading.setAttribute('id', finalId)
        heading.setAttribute('data-toc-heading', 'true')

        const level = heading.tagName.toLowerCase()

        extractedHeadings.push({
          id: finalId,
          text,
          level
        })
      })

      if (extractedHeadings.length > 0) {
        setHeadings(extractedHeadings)
      }
    }

    timeoutId = setTimeout(extractHeadings, 500)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [content])

  // Track active section and reading progress
  useEffect(() => {
    if (headings.length === 0) return

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Calculate reading progress
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight - windowHeight
          const scrolled = window.scrollY
          const progress = documentHeight > 0 ? Math.min((scrolled / documentHeight) * 100, 100) : 0
          setReadingProgress(progress)

          // Find active heading
          let currentActiveId = ""
          const navbarHeight = 100

          for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i]
            const element = document.getElementById(heading.id)

            if (element) {
              const rect = element.getBoundingClientRect()

              if (rect.top <= navbarHeight + 50) {
                currentActiveId = heading.id
                break
              }
            }
          }

          if (currentActiveId !== activeId) {
            setActiveId(currentActiveId)
          }

          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings, activeId])

  const scrollToHeading = (id) => {
    const element = document.getElementById(id)

    if (!element) {
      const allHeadings = document.querySelectorAll('.blog-content h2, .blog-content h3')
      const found = Array.from(allHeadings).find(h => {
        const headingId = h.textContent.trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
        return headingId === id
      })

      if (found) {
        found.setAttribute('id', id)
        scrollToElement(found, id)
        return
      }

      return
    }

    scrollToElement(element, id)
  }

  const scrollToElement = (element, id) => {
    const navbarHeight = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })

    setIsOpen(false)
    setActiveId(id)

    element.style.transition = 'background-color 0.3s'
    element.style.backgroundColor = 'hsl(var(--primary) / 0.1)'
    setTimeout(() => {
      element.style.backgroundColor = ''
    }, 1000)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    setIsOpen(false)
  }

  // Desktop TOC - Always sticky, self-contained
  const DesktopTOC = useMemo(() => {
    if (typeof window === 'undefined') return null

    return (
      <Card className="shadow-xl border-2 border-primary/10">
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
              className="h-8 w-8 p-0 transition-all hover:scale-110"
              aria-label={isCollapsed ? "Expand TOC" : "Collapse TOC"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Reading Progress</span>
              <span className="font-semibold">{Math.round(readingProgress)}%</span>
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
                    "w-full text-left text-sm py-2 px-3 rounded-md transition-all hover:bg-muted hover:scale-105 group cursor-pointer",
                    heading.level === 'h3' && "pl-6 text-xs",
                    activeId === heading.id && "bg-primary/10 text-primary font-medium border-l-2 border-primary scale-105"
                  )}
                  type="button"
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

            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{headings.length} sections</span>
                <Badge variant="outline" className="text-xs">
                  {readingTime ? `${readingTime} min` : `${Math.ceil(headings.length * 0.5)} min`}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToTop}
                className="w-full hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <ArrowUp className="h-3.5 w-3.5 mr-2" />
                Back to Top
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }, [headings, activeId, isCollapsed, readingProgress, readingTime])

  // Mobile TOC - Floating button with drawer - Ultra high z-index
  const MobileTOC = () => (
    <>
      {/* Floating Button - Ultra high z-index */}
      <div className="lg:hidden fixed bottom-24 right-6" style={{ zIndex: 9999 }}>
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full shadow-lg h-14 w-14 p-0 transition-all hover:scale-110 hover:shadow-xl"
            style={{ zIndex: 9999 }}
            aria-label="Open Table of Contents"
          >
            <List className="h-6 w-6" />
          </Button>

          {/* Progress Circle */}
          <svg className="absolute inset-0 pointer-events-none" width="60" height="60" viewBox="0 0 60 60" style={{ zIndex: 9998 }}>
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

      {/* Drawer - Ultra high z-index */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 10000 }}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden" style={{ zIndex: 10001 }}>
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
                className="transition-all hover:scale-110 min-h-[44px] min-w-[44px]"
                aria-label="Close Table of Contents"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="px-4 py-3 bg-muted/30">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-4 custom-scrollbar">
              <nav className="space-y-2">
                {headings.map((heading, index) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    type="button"
                    className={cn(
                      "w-full text-left text-sm py-3 px-4 rounded-lg transition-all cursor-pointer min-h-[44px]",
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

              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={scrollToTop}
                  className="w-full transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 min-h-[44px]"
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

  if (headings.length === 0) {
    return null
  }

  return (
    <>
      {DesktopTOC}
      {showMobileButton && <MobileTOC />}
    </>
  )
}
