'use client'

import { useEffect } from 'react'

/**
 * Service Worker Registration Hook
 * Registers the service worker for offline support and caching
 */
export function useServiceWorker() {
    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            process.env.NODE_ENV === 'production'
        ) {
            // Register service worker
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered successfully:', registration.scope)

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update()
                    }, 60000) // Check every minute
                })
                .catch((error) => {
                    console.error('❌ Service Worker registration failed:', error)
                })

            // Listen for service worker updates
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Service Worker updated, reloading page...')
                window.location.reload()
            })
        }
    }, [])
}
