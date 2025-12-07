import { get, post } from './client';
import type { UserPreferences } from '@/types/preferences';

/**
 * Window status for the 3-day window
 */
export interface WindowStatus3d {
    totalInWindow: number;
    processedInWindow: number;
    newInWindow: number;
    oldestNewTimestamp: string | null;
    maxSummariesPerRun: number;
}

/**
 * Backend configuration information
 */
export interface BackendInfo {
    schedule: string;
    apiVersion: string;
    sheetId?: string;
    defaultRange?: string;
    videosWindowDays?: number;
    maxSummariesPerRun?: number;
    lastSuccessfulRunAt?: string | null;
    hasLastSuccessfulRunAt?: boolean; // Indicates if lastSuccessfulRunAt property exists
    windowStatus3d?: WindowStatus3d | null;
    allowedCategories?: string[]; // Controlled category taxonomy (Arabic) - always array if present
    allowedPriorities?: string[]; // Controlled priority taxonomy - always array if present
}

/**
 * Response from getBackendInfo API
 */
type GetBackendInfoResponse = BackendInfo;

/**
 * Response from getUserPreferences API
 */
interface GetPreferencesResponse {
    preferences: UserPreferences;
}

/**
 * Response from updateUserPreferences API
 */
interface UpdatePreferencesResponse {
    success: boolean;
    preferences: UserPreferences;
}

/**
 * Settings API client for backend configuration and user preferences
 */
export const SettingsApi = {
    /**
     * Fetch backend configuration information
     * 
     * @returns Backend info including schedule and API version
     */
    async getBackendInfo(): Promise<BackendInfo> {
        return get<GetBackendInfoResponse>('getBackendInfo');
    },

    /**
     * Fetch user preferences from backend
     * Note: Currently preferences are stored in localStorage via preferencesStore.
     * This method is for future backend-synced preferences.
     * 
     * @returns User preferences
     */
    async getUserPreferences(): Promise<UserPreferences> {
        const response = await get<GetPreferencesResponse>('getUserPreferences');
        return response.preferences;
    },

    /**
     * Update user preferences on backend
     * Note: Currently preferences are stored in localStorage via preferencesStore.
     * This method is for future backend-synced preferences.
     * 
     * @param preferences - Partial or full user preferences to update
     * @returns Updated preferences
     */
    async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
        const response = await post<UpdatePreferencesResponse>('updateUserPreferences', preferences);
        return response.preferences;
    },
};
