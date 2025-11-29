'use client'

/**
 * Client-side View Tracker Component
 * 
 * This component runs on the client-side to track post views
 * for all users, including non-logged-in visitors.
 * 
 * It sends a request to increment the view count when the post is loaded.
 */

import { useEffect, useRef } from 'react'

export default function ViewTracker({ postId }) {
    const hasTracked = useRef(false)

    useEffect(() => {
        // Only track once per page load
        if (hasTracked.current || !postId) {
            console.log('[ViewTracker] Skipping:', { hasTracked: hasTracked.current, postId })
            return
        }

        hasTracked.current = true
        console.log('[ViewTracker] Tracking view for post:', postId)

        // Send view tracking request
        fetch(`/api/posts/${postId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(data => {
                console.log('[ViewTracker] Response:', data)
            })
            .catch(error => {
                console.error('[ViewTracker] Error:', error)
            })
    }, [postId])

    // This component doesn't render anything
    return null
}
