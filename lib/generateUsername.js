import User from '@/models/User'

/**
 * Generate a unique username from a name
 * @param {string} name - User's full name
 * @param {import('mongoose').Connection} [connection] - Optional mongoose connection
 * @returns {Promise<string>} - Unique username
 */
export async function generateUsername(name) {
    if (!name || typeof name !== 'string') {
        throw new Error('Name is required to generate username')
    }

    // Convert name to username format
    // "John Doe" -> "john_doe"
    let baseUsername = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^a-z0-9_]/g, '') // Remove special characters
        .substring(0, 30) // Limit to 30 characters

    // Ensure minimum length
    if (baseUsername.length < 3) {
        baseUsername = baseUsername.padEnd(3, '_')
    }

    // Check if username is available
    let username = baseUsername
    let counter = 1

    while (true) {
        const existingUser = await User.findOne({ username })

        if (!existingUser) {
            return username
        }

        // Username exists, try with number suffix
        counter++
        username = `${baseUsername}_${counter}`

        // Ensure we don't exceed 30 characters
        if (username.length > 30) {
            // Truncate base username to make room for counter
            const maxBaseLength = 30 - `_${counter}`.length
            username = `${baseUsername.substring(0, maxBaseLength)}_${counter}`
        }

        // Safety check to prevent infinite loop
        if (counter > 1000) {
            throw new Error('Unable to generate unique username')
        }
    }
}

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Username is required' }
    }

    const trimmed = username.trim()

    if (trimmed.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' }
    }

    if (trimmed.length > 30) {
        return { valid: false, error: 'Username cannot be more than 30 characters' }
    }

    // Only allow lowercase letters, numbers, and underscores
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
        return {
            valid: false,
            error: 'Username can only contain lowercase letters, numbers, and underscores'
        }
    }

    // Don't allow usernames that start or end with underscore
    if (trimmed.startsWith('_') || trimmed.endsWith('_')) {
        return { valid: false, error: 'Username cannot start or end with underscore' }
    }

    // Don't allow consecutive underscores
    if (trimmed.includes('__')) {
        return { valid: false, error: 'Username cannot contain consecutive underscores' }
    }

    return { valid: true, error: null }
}
