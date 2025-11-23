"use client"

import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

/**
 * Autosave Hook for Blog Post Creation
 * 
 * Automatically saves form data to localStorage every 30 seconds
 * Restores draft on component mount if available
 * 
 * @param {Object} formData - Current form state
 * @param {Function} setFormData - Form state setter
 * @param {string} storageKey - localStorage key (default: 'blog-post-draft')
 * @param {number} interval - Save interval in ms (default: 30000 = 30s)
 * @returns {Object} { lastSaved, saveDraft, clearDraft, hasDraft }
 */
export function useAutosave(formData, setFormData, storageKey = 'blog-post-draft', interval = 30000) {
    const lastSavedRef = useRef(null)
    const timeoutRef = useRef(null)
    const isRestoringRef = useRef(false)

    // Save draft to localStorage
    const saveDraft = useCallback(() => {
        try {
            // Don't save if no meaningful content
            if (!formData.title && !formData.content && !formData.excerpt) {
                return
            }

            const draftData = {
                ...formData,
                savedAt: new Date().toISOString(),
                version: '1.0'
            }

            localStorage.setItem(storageKey, JSON.stringify(draftData))
            lastSavedRef.current = new Date()

            // Silent save (no toast notification to avoid spam)
            console.log('✅ Draft saved at', lastSavedRef.current.toLocaleTimeString())
        } catch (error) {
            console.error('Failed to save draft:', error)
            // Only show error if localStorage is full or unavailable
            if (error.name === 'QuotaExceededError') {
                toast.error('Unable to save draft - storage full')
            }
        }
    }, [formData, storageKey])

    // Clear draft from localStorage
    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(storageKey)
            lastSavedRef.current = null
            toast.success('Draft cleared')
        } catch (error) {
            console.error('Failed to clear draft:', error)
        }
    }, [storageKey])

    // Check if draft exists
    const hasDraft = useCallback(() => {
        try {
            const saved = localStorage.getItem(storageKey)
            return !!saved
        } catch (error) {
            return false
        }
    }, [storageKey])

    // Restore draft on mount
    useEffect(() => {
        if (isRestoringRef.current) return

        try {
            const saved = localStorage.getItem(storageKey)

            if (saved) {
                const draftData = JSON.parse(saved)
                const savedAt = new Date(draftData.savedAt)
                const hoursSince = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60)

                // Only restore if draft is less than 7 days old
                if (hoursSince < 168) {
                    isRestoringRef.current = true

                    // Remove metadata before restoring
                    const { savedAt: _, version: __, ...restoreData } = draftData
                    setFormData(restoreData)
                    lastSavedRef.current = savedAt

                    toast.success('Draft restored!', {
                        description: `Last saved ${savedAt.toLocaleString()}`,
                        duration: 5000,
                        action: {
                            label: 'Clear',
                            onClick: clearDraft
                        }
                    })
                } else {
                    // Draft too old, clear it
                    localStorage.removeItem(storageKey)
                }
            }
        } catch (error) {
            console.error('Failed to restore draft:', error)
            toast.error('Failed to restore draft')
        }
    }, [storageKey, setFormData, clearDraft])

    // Auto-save on interval
    useEffect(() => {
        // Skip if we just restored
        if (isRestoringRef.current) {
            isRestoringRef.current = false
            return
        }

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            saveDraft()
        }, interval)

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [formData, interval, saveDraft])

    // Save on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            saveDraft()
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [saveDraft])

    return {
        lastSaved: lastSavedRef.current,
        saveDraft,
        clearDraft,
        hasDraft: hasDraft()
    }
}
