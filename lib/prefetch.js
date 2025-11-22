'use client'

import { useEffect, useRef } from 'react'

/**
 * Prefetch data on link hover
 * Usage: <Link {...prefetchOnHover('/api/endpoint')} href="/page">
 */
export function prefetchOnHover(url) {
    return {
        onMouseEnter: () => {
            // Prefetch the data
            if (typeof window !== 'undefined') {
                fetch(url, { method: 'GET' }).catch(() => {
                    // Silently fail - prefetch is optional
                })
            }
        }
    }
}

/**
 * Prefetch data when element comes into view
 * Usage: const ref = usePrefetchOnView('/api/endpoint')
 */
export function usePrefetchOnView(url, options = {}) {
    const ref = useRef(null)
    const hasPrefetched = useRef(false)

    useEffect(() => {
        if (!ref.current || hasPrefetched.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasPrefetched.current) {
                        // Prefetch the data
                        fetch(url, { method: 'GET' }).catch(() => {
                            // Silently fail
                        })
                        hasPrefetched.current = true
                        observer.disconnect()
                    }
                })
            },
            {
                rootMargin: options.rootMargin || '50px',
                threshold: options.threshold || 0.1
            }
        )

        observer.observe(ref.current)

        return () => observer.disconnect()
    }, [url, options.rootMargin, options.threshold])

    return ref
}

/**
 * Prefetch multiple URLs
 */
export function prefetchMultiple(urls) {
    if (typeof window === 'undefined') return

    urls.forEach((url) => {
        fetch(url, { method: 'GET' }).catch(() => {
            // Silently fail
        })
    })
}

/**
 * Smart prefetch - only prefetch on fast connections
 */
export function smartPrefetch(url) {
    if (typeof window === 'undefined') return

    // Check connection speed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (connection) {
        // Only prefetch on fast connections (4g or wifi)
        if (connection.effectiveType === '4g' || connection.effectiveType === 'wifi') {
            fetch(url, { method: 'GET' }).catch(() => { })
        }
    } else {
        // If we can't detect connection, prefetch anyway
        fetch(url, { method: 'GET' }).catch(() => { })
    }
}
