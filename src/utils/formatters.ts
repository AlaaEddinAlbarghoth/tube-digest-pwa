/**
 * Shared formatting utilities
 */

/**
 * Format video duration in seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted string like "12:34" or empty string if no duration
 */
export function formatVideoDuration(seconds?: number): string {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format duration in milliseconds to a human readable format
 * @param ms - Duration in milliseconds
 * @returns Formatted string like "5m 30s" or "-" if no duration
 */
export function formatRunDuration(ms?: number): string {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Capitalize first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
