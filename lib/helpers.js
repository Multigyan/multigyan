import { cn } from "@/lib/utils"

// Generate URL-friendly slug from title
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-') // Remove leading/trailing hyphens
}

// Format date for display
export function formatDate(date) {
  // ✅ Handle null, undefined, or empty values
  if (!date) {
    return 'N/A'
  }

  try {
    // Convert to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date)
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date)
      return 'Invalid Date'
    }

    // Format the valid date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting date:', error, 'Date value:', date)
    return 'Invalid Date'
  }
}

// Format date with time for display
export function formatDateTime(date) {
  // ✅ Handle null, undefined, or empty values
  if (!date) {
    return 'N/A'
  }

  try {
    // Convert to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date)
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date)
      return 'Invalid Date'
    }

    // Format the valid date with time
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting datetime:', error, 'Date value:', date)
    return 'Invalid Date'
  }
}

// Format date as relative time (e.g., "2 days ago")
export function formatRelativeTime(date) {
  // ✅ Handle null, undefined, or empty values
  if (!date) {
    return 'N/A'
  }

  try {
    // Convert to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date)
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date)
      return 'Invalid Date'
    }

    const now = new Date()
    const diffInSeconds = Math.floor((now - dateObj) / 1000)

    // Less than a minute
    if (diffInSeconds < 60) {
      return 'Just now'
    }

    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    }

    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    }

    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    }

    // Less than a month
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800)
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
    }

    // Less than a year
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `${months} ${months === 1 ? 'month' : 'months'} ago`
    }

    // More than a year
    const years = Math.floor(diffInSeconds / 31536000)
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  } catch (error) {
    console.error('Error formatting relative time:', error, 'Date value:', date)
    return 'Invalid Date'
  }
}

// Calculate reading time
export function calculateReadingTime(content) {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const readingTime = Math.ceil(words / wordsPerMinute)
  return readingTime
}

// Truncate text to specified length
export function truncateText(text, maxLength = 150) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate excerpt from content
export function generateExcerpt(content, maxLength = 160) {
  // Remove HTML tags if present
  const plainText = content.replace(/<[^>]*>/g, '')
  return truncateText(plainText, maxLength)
}

// Format number with commas (e.g., 1000 -> "1,000")
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('en-US')
}

// Format bytes to human readable format
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '??'
  
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Generate random color for avatars
export function generateColor(str) {
  if (!str) return '#666666'
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // green
    '#06B6D4', // cyan
    '#6366F1', // indigo
  ]
  
  return colors[Math.abs(hash) % colors.length]
}
