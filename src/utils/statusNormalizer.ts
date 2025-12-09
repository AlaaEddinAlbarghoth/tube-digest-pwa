import type { VideoStatus } from '@/types/enums';

/**
 * Normalizes video status to a standard enum value.
 * Handles case-insensitive matching and common variations.
 * 
 * @param status - Raw status string from API or store
 * @returns Normalized status: "new" | "read" | "processed" | "unknown"
 */
export function normalizeStatus(status?: string | null): VideoStatus | 'unknown' {
    if (!status) {
        return 'unknown';
    }

    const normalized = status.trim().toLowerCase();

    // Handle "read" variations
    if (normalized === 'read' || normalized === 'READ' || normalized === 'Read') {
        return 'read';
    }

    // Handle "new" variations
    if (normalized === 'new' || normalized === 'NEW' || normalized === 'New') {
        return 'new';
    }

    // Handle "processed" variations
    if (normalized === 'processed' || normalized === 'PROCESSED' || normalized === 'Processed') {
        return 'processed';
    }

    // Unknown status - log warning in dev
    if (import.meta.env.DEV) {
        console.warn('[normalizeStatus] Unknown status value:', status);
    }

    return 'unknown';
}

/**
 * Checks if a video status is "read" (case-insensitive).
 * 
 * @param status - Video status to check
 * @returns True if status is read, false otherwise
 */
export function isReadStatus(status?: string | null): boolean {
    return normalizeStatus(status) === 'read';
}

