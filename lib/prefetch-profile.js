'use client'

/**
 * Prefetch profile data on link hover
 * Usage: <Link {...prefetchProfile(username)} href={`/profile/${username}`}>
 */
export function prefetchProfile(username) {
    return {
        onMouseEnter: () => {
            if (typeof window !== 'undefined') {
                // Prefetch the profile page
                fetch(`/profile/${username}`).catch(() => { })
            }
        }
    }
}

/**
 * Prefetch profile stats on hover
 * Usage: <Link {...prefetchProfileStats(userId)} href={`/profile/${username}`}>
 */
export function prefetchProfileStats(userId) {
    return {
        onMouseEnter: () => {
            if (typeof window !== 'undefined') {
                // Prefetch profile stats
                fetch(`/api/users/${userId}/stats`).catch(() => { })
            }
        }
    }
}

/**
 * Combined prefetch for profile page and stats
 * Usage: <Link {...prefetchProfileData(username, userId)} href={`/profile/${username}`}>
 */
export function prefetchProfileData(username, userId) {
    return {
        onMouseEnter: () => {
            if (typeof window !== 'undefined') {
                // Prefetch both profile page and stats
                Promise.all([
                    fetch(`/profile/${username}`).catch(() => { }),
                    fetch(`/api/users/${userId}/stats`).catch(() => { })
                ])
            }
        }
    }
}
