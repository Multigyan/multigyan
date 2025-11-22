// SWR Configuration for Dashboard Performance Optimization
// This provides client-side caching for instant page loads on revisit

export const swrConfig = {
    // ⚡ PERFORMANCE: Reduce unnecessary revalidations
    revalidateOnFocus: false,        // Don't refetch when window regains focus
    revalidateOnReconnect: false,    // Don't refetch on network reconnect
    revalidateIfStale: true,         // Only revalidate if data is stale

    // ⚡ CACHING: Keep data fresh but cached
    dedupingInterval: 60000,         // Dedupe requests within 60 seconds
    focusThrottleInterval: 300000,   // Throttle focus revalidation to 5 minutes

    // ⚡ ERROR HANDLING: Retry failed requests
    errorRetryCount: 3,
    errorRetryInterval: 5000,

    // ⚡ LOADING: Show stale data while revalidating
    keepPreviousData: true,

    // ⚡ SUSPENSE: Enable React Suspense support
    suspense: false,

    // ⚡ FETCHER: Default fetch function
    fetcher: (url) => fetch(url).then(res => {
        if (!res.ok) throw new Error('API request failed')
        return res.json()
    })
}

// Specific config for dashboard stats (refresh every minute)
export const dashboardStatsConfig = {
    ...swrConfig,
    refreshInterval: 60000,  // Auto-refresh every 60 seconds
    revalidateOnMount: true  // Always fetch fresh data on mount
}

// Specific config for profile stats (refresh every 2 minutes)
export const profileStatsConfig = {
    ...swrConfig,
    refreshInterval: 120000,  // Auto-refresh every 2 minutes
    revalidateOnMount: true
}

// Specific config for settings (no auto-refresh, only on demand)
export const settingsConfig = {
    ...swrConfig,
    refreshInterval: 0,       // No auto-refresh
    revalidateOnMount: false  // Use cached data if available
}
