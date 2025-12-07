import { useEffect, useRef } from 'react';

/**
 * Auto-refresh hook for video lists
 * Polls every 90 seconds (with +/- 10s jitter) when page is visible
 * Stops when tab is hidden, resumes when visible
 * 
 * @param fetchFn Function to call for refresh
 * @param enabled Whether auto-refresh is enabled (default: true)
 */
export function useAutoRefresh(
    fetchFn: (signal: AbortSignal) => Promise<void>,
    enabled = true
) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isVisibleRef = useRef(true);

    useEffect(() => {
        if (!enabled) return;

        // Handle visibility change
        const handleVisibilityChange = () => {
            const isVisible = !document.hidden;
            isVisibleRef.current = isVisible;

            if (isVisible) {
                // Resume polling when tab becomes visible
                startPolling();
            } else {
                // Stop polling when tab is hidden
                stopPolling();
            }
        };

        // Start polling
        const startPolling = () => {
            // Clear any existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // Abort any in-flight request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController();

            // Calculate jittered interval (90s +/- 10s = 80-100s)
            const baseInterval = 90 * 1000; // 90 seconds
            const jitter = (Math.random() * 20 - 10) * 1000; // +/- 10 seconds
            const interval = baseInterval + jitter;

            // Initial fetch
            fetchFn(abortControllerRef.current.signal).catch(() => {
                // Ignore errors in auto-refresh (they're handled by the store)
            });

            // Set up interval
            intervalRef.current = setInterval(() => {
                // Only poll if tab is visible
                if (isVisibleRef.current) {
                    // Abort previous request if still in flight
                    if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                    }

                    // Create new abort controller
                    abortControllerRef.current = new AbortController();

                    fetchFn(abortControllerRef.current.signal).catch(() => {
                        // Ignore errors in auto-refresh
                    });
                }
            }, interval);
        };

        // Stop polling
        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        };

        // Start polling on mount
        startPolling();

        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup on unmount
        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchFn, enabled]);
}

