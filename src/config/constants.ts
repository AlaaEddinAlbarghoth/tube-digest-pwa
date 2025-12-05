import { getBackendBaseUrl } from './runtimeConfig';

export const APP_CONFIG = {
    name: 'TubeDigest',
    version: '1.0.0',
    description: 'Your daily YouTube video summaries powered by AI',
} as const;

/**
 * API configuration
 * Note: baseUrl is a getter function to support lazy runtime config loading
 */
export const API_CONFIG = {
    get baseUrl(): string {
        return getBackendBaseUrl();
    },
    timeout: 30000,
} as const;

export const DATE_RANGES = {
    today: { label: 'Today', days: 0 },
    '3d': { label: '3 days', days: 3 },
    '7d': { label: '7 days', days: 7 },
    '14d': { label: '14 days', days: 14 },
    '30d': { label: '30 days', days: 30 },
} as const;

export const PRIORITIES = {
    low: { label: 'Low', color: 'gray' },
    medium: { label: 'Medium', color: 'yellow' },
    high: { label: 'High', color: 'red' },
} as const;

export const VIDEO_STATUSES = {
    new: { label: 'New', color: 'blue' },
    processed: { label: 'Processed', color: 'green' },
    read: { label: 'Read', color: 'gray' },
} as const;

export const STORAGE_KEYS = {
    preferences: 'tube-digest-preferences',
} as const;
