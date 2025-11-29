/**
 * Client-side Product View Tracker Component
 * 
 * Tracks product views for all users, including non-logged-in visitors.
 * Works with cached pages by sending view tracking request from the browser.
 */

'use client'

import { useEffect, useRef } from 'react'

export default function ProductViewTracker({ productId }) {
    const hasTracked = useRef(false)

    useEffect(() => {
        // Only track once per page load
        if (hasTracked.current || !productId) return

        hasTracked.current = true

        // Send view tracking request
        fetch(`/api/store/products/${productId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Don't wait for response - fire and forget
        }).catch(() => {
            // Silently fail - view tracking is non-critical
        })
    }, [productId])

    // This component doesn't render anything
    return null
}
