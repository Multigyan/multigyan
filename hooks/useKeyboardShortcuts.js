/**
 * Keyboard Shortcuts Hook
 * 
 * Provides keyboard shortcuts for admin panel
 * Improves productivity and user experience
 * 
 * Usage:
 * useKeyboardShortcuts({
 *   'ctrl+k': () => focusSearch(),
 *   'ctrl+s': () => saveChanges(),
 *   'esc': () => closeDialog()
 * })
 */

import { useEffect } from 'react'

export function useKeyboardShortcuts(shortcuts) {
    useEffect(() => {
        function handleKeyDown(event) {
            // Build key combination string
            const keys = []
            if (event.ctrlKey || event.metaKey) keys.push('ctrl')
            if (event.shiftKey) keys.push('shift')
            if (event.altKey) keys.push('alt')

            // Add the actual key
            const key = event.key.toLowerCase()
            if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
                keys.push(key)
            }

            const combination = keys.join('+')

            // Check if this combination has a handler
            if (shortcuts[combination]) {
                // Prevent default browser behavior
                event.preventDefault()
                // Execute the handler
                shortcuts[combination](event)
            }
        }

        // Add event listener
        document.addEventListener('keydown', handleKeyDown)

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [shortcuts])
}

/**
 * Common keyboard shortcuts for admin pages
 */
export const ADMIN_SHORTCUTS = {
    SEARCH: 'ctrl+k',
    SAVE: 'ctrl+s',
    CLOSE: 'esc',
    SELECT_ALL: 'ctrl+a',
    NEW: 'ctrl+n',
    REFRESH: 'ctrl+r'
}
