"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook to fetch and manage related posts
 * @param {string} authorId - The author's ID
 * @param {string} currentPostId - The current post's ID to exclude
 * @returns {Object} { relatedPosts, loading }
 */
export function useRelatedPosts(authorId, currentPostId) {
    const [relatedPosts, setRelatedPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRelatedPosts = async () => {
            if (!authorId) {
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/posts?status=published&author=${authorId}&limit=4`)
                const data = await response.json()

                if (response.ok) {
                    // Filter out the current post
                    const filtered = data.posts?.filter(p => p._id !== currentPostId) || []
                    setRelatedPosts(filtered.slice(0, 3))
                }
            } catch (error) {
                console.error('Error fetching related posts:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRelatedPosts()
    }, [authorId, currentPostId])

    return { relatedPosts, loading }
}
