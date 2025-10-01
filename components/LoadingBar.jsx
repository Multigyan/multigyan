"use client"

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

export default function LoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Configure NProgress with better settings
    NProgress.configure({ 
      showSpinner: false,        // Hide the spinner in top right
      trickleSpeed: 200,         // How fast the bar moves
      minimum: 0.08,             // Minimum percentage (starts at 8%)
      easing: 'ease',            // Animation easing
      speed: 500                 // Animation speed
    })

    return () => {
      NProgress.done()
    }
  }, [])

  useEffect(() => {
    // When route changes, complete the loading bar
    NProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    // Function to start loading when any link is clicked
    const handleLinkClick = (event) => {
      // Get the clicked element
      const target = event.currentTarget
      
      // Check if it's a valid link
      if (target.tagName === 'A' && target.href) {
        const currentUrl = window.location.href
        const targetUrl = target.href

        // Only start loading if it's a different page
        if (targetUrl !== currentUrl) {
          // Check if it's not an external link
          const currentDomain = window.location.hostname
          const targetDomain = new URL(targetUrl).hostname

          if (currentDomain === targetDomain) {
            NProgress.start()
          }
        }
      }
    }

    // Function to add event listeners to all links
    const addListenersToLinks = () => {
      const allLinks = document.querySelectorAll('a')
      allLinks.forEach(link => {
        // Remove old listener (if any) to prevent duplicates
        link.removeEventListener('click', handleLinkClick)
        // Add new listener
        link.addEventListener('click', handleLinkClick)
      })
    }

    // Add listeners when component mounts
    addListenersToLinks()

    // Watch for new links being added to the page (for dynamic content)
    const observer = new MutationObserver(() => {
      addListenersToLinks()
    })

    // Start observing the entire document for changes
    observer.observe(document.body, {
      childList: true,      // Watch for new/removed child elements
      subtree: true         // Watch all descendants, not just direct children
    })

    // Cleanup function
    return () => {
      observer.disconnect()
      // Remove all event listeners
      const allLinks = document.querySelectorAll('a')
      allLinks.forEach(link => {
        link.removeEventListener('click', handleLinkClick)
      })
    }
  }, [])

  // This component doesn't render anything visible
  // It just sets up the loading bar behavior
  return null
}
