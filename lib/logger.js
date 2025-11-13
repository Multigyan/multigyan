// =========================================
// LOGGER UTILITY
// =========================================
// Centralized logging with environment-based control
// Usage:
//   import logger from '@/lib/logger'
//   logger.info('User logged in', { userId: user.id })
//   logger.error('Failed to fetch', error)

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

const logger = {
  // Debug: Only shown in development
  debug: (...args) => {
    if (isDevelopment) {
      console.log('🔍 [DEBUG]', ...args)
    }
  },

  // Info: Only shown in development
  info: (...args) => {
    if (isDevelopment) {
      console.log('ℹ️ [INFO]', ...args)
    }
  },

  // Success: Only shown in development
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅ [SUCCESS]', ...args)
    }
  },

  // Warning: Always shown (important!)
  warn: (...args) => {
    console.warn('⚠️ [WARN]', ...args)
  },

  // Error: Always shown (critical!)
  error: (...args) => {
    console.error('❌ [ERROR]', ...args)
  },

  // Performance: Track execution time
  time: (label) => {
    if (isDevelopment) {
      console.time(`⏱️ ${label}`)
    }
  },

  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(`⏱️ ${label}`)
    }
  },
}

export default logger
