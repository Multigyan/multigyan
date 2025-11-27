"use client"

import { useAutoTheme } from "@/hooks/useAutoTheme"

/**
 * Component that enables auto theme switching
 * Place this in your layout to enable time-based theme switching
 */
export function AutoThemeHandler() {
    useAutoTheme()
    return null
}
