"use client"

import { useState, useEffect } from 'react'

export function useTOC(content) {
    const [headings, setHeadings] = useState([])
    const [activeId, setActiveId] = useState('')
    const [readingProgress, setReadingProgress] = useState(0)

    // Extract headings from blog content
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

    // Scroll to heading function
    const scrollToHeading = (id) => {
        const element = document.getElementById(id)

        if (!element) return

        const navbarHeight = 100
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        })

        setActiveId(id)

        // Highlight effect
        element.style.transition = 'background-color 0.3s'
        element.style.backgroundColor = 'hsl(var(--primary) / 0.1)'
        setTimeout(() => {
            element.style.backgroundColor = ''
        }, 1000)
    }

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return {
        headings,
        activeId,
        readingProgress,
        scrollToHeading,
        scrollToTop
    }
}
