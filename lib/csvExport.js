/**
 * Utility functions for CSV export
 * 
 * Provides functions to export data to CSV format
 * for users, posts, and comments
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data, headers) {
    if (!data || data.length === 0) return ''

    // Create header row
    const headerRow = headers.map(h => `"${h.label}"`).join(',')

    // Create data rows
    const dataRows = data.map(item => {
        return headers.map(h => {
            const value = h.key.split('.').reduce((obj, key) => obj?.[key], item) || ''
            // Escape quotes and wrap in quotes
            return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
    })

    return [headerRow, ...dataRows].join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }
}

/**
 * Export users to CSV
 */
export function exportUsersToCSV(users) {
    const headers = [
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Role', key: 'role' },
        { label: 'Status', key: 'isActive' },
        { label: 'Email Verified', key: 'emailVerified' },
        { label: 'Joined Date', key: 'createdAt' },
        { label: 'Last Login', key: 'lastLoginAt' }
    ]

    const csv = arrayToCSV(users, headers)
    const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csv, filename)
}

/**
 * Export posts to CSV
 */
export function exportPostsToCSV(posts) {
    const headers = [
        { label: 'Title', key: 'title' },
        { label: 'Author', key: 'author.name' },
        { label: 'Category', key: 'category.name' },
        { label: 'Status', key: 'status' },
        { label: 'Views', key: 'views' },
        { label: 'Likes', key: 'likeCount' },
        { label: 'Comments', key: 'comments.length' },
        { label: 'Reading Time', key: 'readingTime' },
        { label: 'Published Date', key: 'publishedAt' },
        { label: 'Created Date', key: 'createdAt' }
    ]

    const csv = arrayToCSV(posts, headers)
    const filename = `posts_export_${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csv, filename)
}

/**
 * Export comments to CSV
 */
export function exportCommentsToCSV(comments) {
    const headers = [
        { label: 'Author', key: 'author.name' },
        { label: 'Email', key: 'author.email' },
        { label: 'Comment', key: 'content' },
        { label: 'Post Title', key: 'post.title' },
        { label: 'Status', key: 'status' },
        { label: 'Created Date', key: 'createdAt' }
    ]

    const csv = arrayToCSV(comments, headers)
    const filename = `comments_export_${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csv, filename)
}
