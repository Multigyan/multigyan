"use client"

import { useState } from "react"

/**
 * Custom hook to manage comment statistics
 * @param {Array} initialComments - Initial comments array
 * @returns {Object} { commentStats, handleCommentStatsUpdate }
 */
export function useCommentStats(initialComments) {
    const [commentStats, setCommentStats] = useState({
        approved: initialComments?.filter(c => c.isApproved).length || 0,
        totalLikes: 0
    })

    const handleCommentStatsUpdate = (newStats) => {
        setCommentStats(newStats)
    }

    return { commentStats, handleCommentStatsUpdate }
}
