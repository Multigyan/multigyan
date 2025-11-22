/**
 * Undo Manager
 * 
 * Manages undo functionality for admin actions
 */

class UndoManager {
    constructor() {
        this.undoStack = []
        this.maxStackSize = 50
    }

    /**
     * Add action to undo stack
     */
    addAction(action) {
        this.undoStack.push({
            ...action,
            timestamp: Date.now()
        })

        // Limit stack size
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift()
        }
    }

    /**
     * Get last action
     */
    getLastAction() {
        return this.undoStack[this.undoStack.length - 1]
    }

    /**
     * Remove last action from stack
     */
    removeLastAction() {
        return this.undoStack.pop()
    }

    /**
     * Clear all actions
     */
    clear() {
        this.undoStack = []
    }

    /**
     * Get all actions
     */
    getAllActions() {
        return [...this.undoStack]
    }
}

// Create singleton instance
const undoManager = new UndoManager()

export default undoManager

/**
 * React hook for undo functionality
 */
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useUndo() {
    const [canUndo, setCanUndo] = useState(false)

    const addUndoAction = useCallback((action) => {
        undoManager.addAction(action)
        setCanUndo(true)
    }, [])

    const undo = useCallback(async () => {
        const lastAction = undoManager.getLastAction()

        if (!lastAction) {
            toast.error('Nothing to undo')
            return false
        }

        try {
            // Execute undo function
            if (lastAction.undoFn) {
                await lastAction.undoFn()
            }

            // Remove from stack
            undoManager.removeLastAction()

            // Update state
            setCanUndo(undoManager.getAllActions().length > 0)

            toast.success(`Undone: ${lastAction.description}`)
            return true
        } catch (error) {
            toast.error('Failed to undo action')
            return false
        }
    }, [])

    const clearUndo = useCallback(() => {
        undoManager.clear()
        setCanUndo(false)
    }, [])

    return {
        canUndo,
        addUndoAction,
        undo,
        clearUndo
    }
}

/**
 * Undo toast notification component
 */
export function showUndoToast(description, undoFn) {
    const action = {
        description,
        undoFn,
        timestamp: Date.now()
    }

    undoManager.addAction(action)

    toast.success(description, {
        action: {
            label: 'Undo',
            onClick: async () => {
                try {
                    await undoFn()
                    toast.success('Action undone')
                } catch (error) {
                    toast.error('Failed to undo')
                }
            }
        },
        duration: 5000
    })
}
