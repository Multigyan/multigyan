"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

/**
 * Hook to automatically switch theme based on time of day
 * Light mode: 6 AM - 6 PM
 * Dark mode: 6 PM - 6 AM
 */
export function useAutoTheme() {
    const { theme, setTheme, resolvedTheme } = useTheme()

    useEffect(() => {
        // Only apply auto theme if user has selected "auto" mode
        if (theme !== "auto") return

        const getTimeBasedTheme = () => {
            const hour = new Date().getHours()
            // Light mode from 6 AM (6) to 6 PM (18)
            return (hour >= 6 && hour < 18) ? "light" : "dark"
        }

        // Set initial theme
        const timeBasedTheme = getTimeBasedTheme()
        if (resolvedTheme !== timeBasedTheme) {
            setTheme(timeBasedTheme)
        }

        // Check every minute if we need to switch
        const interval = setInterval(() => {
            if (theme === "auto") {
                const newTheme = getTimeBasedTheme()
                if (resolvedTheme !== newTheme) {
                    setTheme(newTheme)
                }
            }
        }, 60000) // Check every minute

        return () => clearInterval(interval)
    }, [theme, resolvedTheme, setTheme])

    return { theme, resolvedTheme }
}
