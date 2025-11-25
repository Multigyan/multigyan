"use client"

import { useEffect, useState } from "react"

export default function ReadingProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const updateProgress = () => {
            // Get scroll position
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = (scrollTop / docHeight) * 100

            setProgress(Math.min(100, Math.max(0, scrollPercent)))
        }

        // Update on scroll
        window.addEventListener('scroll', updateProgress, { passive: true })

        // Initial update
        updateProgress()

        return () => window.removeEventListener('scroll', updateProgress)
    }, [])

    return (
        <div
            className="fixed top-0 left-0 right-0 h-1 bg-muted z-50"
            role="progressbar"
            aria-label="Reading progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
