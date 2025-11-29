'use client'

/**
 * Client-side Product View Tracker Component
 * 
 * Tracks product views for all users, including non-logged-in visitors.
 * Works with cached pages by sending view tracking request from the browser.
 */

import { useEffect, useRef } from 'react'

export default function ProductViewTracker({ productSlug }) {
    const hasTracked = useRef(false)

    useEffect(() => {
        // Only track once per page load
        if (hasTracked.current || !productSlug) return

        hasTracked.current = true

        // Send view tracking request
        fetch(`/api/store/products/${productSlug}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }).catch(() => {
            // Silently fail - view tracking is non-critical
        })
    }, [productSlug])

    // This component doesn't render anything
    return null
}
