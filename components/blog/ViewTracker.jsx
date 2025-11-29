/**
 * Client-side View Tracker Component
 * 
 * This component runs on the client-side to track post views
 * for all users, including non-logged-in visitors.
 * 
 * It sends a request to increment the view count when the post is loaded.
 */

'use client'

import { useEffect, useRef } from 'react'

export default function ViewTracker({ postId }) {
    const hasTracked = useRef(false)

    useEffect(() => {
        // Only track once per page load
        if (hasTracked.current || !postId) return

        hasTracked.current = true

        // Send view tracking request
        fetch(`/api/posts/${postId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Don't wait for response - fire and forget
        }).catch(() => {
            // Silently fail - view tracking is non-critical
        })
    }, [postId])

    // This component doesn't render anything
    return null
}
