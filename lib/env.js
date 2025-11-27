/**
 * Environment Variables Validation
 * 
 * Validates all required environment variables at startup.
 * Throws clear errors if any are missing or invalid.
 * 
 * This file is imported in the root layout to ensure validation happens early.
 */

import logger from './logger'

// Define all required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
]

// Define optional but recommended environment variables
const optionalEnvVars = [
    'RESEND_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_GOOGLE_ADSENSE_ID',
]

/**
 * Validate URL format
 */
function isValidUrl(string) {
    try {
        new URL(string)
        return true
    } catch {
        return false
    }
}

/**
 * Validate environment variables
 */
export function validateEnv() {
    const errors = []
    const warnings = []

    // Check required variables
    requiredEnvVars.forEach((varName) => {
        const value = process.env[varName]

        if (!value) {
            errors.push(`Missing required environment variable: ${varName}`)
            return
        }

        // Validate specific formats
        if (varName.includes('URL') && !isValidUrl(value)) {
            errors.push(`Invalid URL format for ${varName}: ${value}`)
        }

        if (varName === 'MONGODB_URI' && !value.startsWith('mongodb')) {
            errors.push(`Invalid MongoDB URI format for ${varName}`)
        }
    })

    // Check optional variables
    optionalEnvVars.forEach((varName) => {
        const value = process.env[varName]

        if (!value) {
            warnings.push(`Optional environment variable not set: ${varName}`)
        }
    })

    // Log results
    if (errors.length > 0) {
        logger.error('Environment validation failed:', { errors })
        throw new Error(
            `Environment validation failed:\n${errors.join('\n')}\n\nPlease check your .env file.`
        )
    }

    if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
        logger.warn('Some optional environment variables are not set:', { warnings })
    }

    logger.success('Environment variables validated successfully')
}

/**
 * Get all environment variables (for debugging in development only)
 */
export function getEnvInfo() {
    if (process.env.NODE_ENV !== 'development') {
        return { error: 'Environment info only available in development' }
    }

    return {
        required: requiredEnvVars.map((name) => ({
            name,
            set: !!process.env[name],
        })),
        optional: optionalEnvVars.map((name) => ({
            name,
            set: !!process.env[name],
        })),
    }
}

// Auto-validate on import (only in development and production, not during build)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
        validateEnv()
    } catch (error) {
        // In development, log and continue
        // In production, this will crash the app (which is what we want)
        if (process.env.NODE_ENV === 'development') {
            console.error(error.message)
        } else {
            throw error
        }
    }
}
