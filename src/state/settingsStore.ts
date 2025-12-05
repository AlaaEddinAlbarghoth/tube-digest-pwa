import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SettingsApi, type BackendInfo } from '@/api/settingsApi';
import { ApiError } from '@/api/client';
import type { UserPreferences } from '@/types/preferences';
import type { ThemeMode } from '@/types/enums';

/**
 * Settings store state interface
 */
interface SettingsState {
    // User Preferences (persisted to localStorage)
    preferences: UserPreferences;

    // Backend Info (fetched from API)
    backendInfo: BackendInfo | null;

    // Loading states
    loading: boolean;
    error: string | null;

    // Actions
    loadSettings: () => Promise<void>;
    updatePreferences: (partial: Partial<UserPreferences>) => void;
    setTheme: (theme: ThemeMode) => void;
    clearError: () => void;
}

/**
 * Default user preferences
 */
const defaultPreferences: UserPreferences = {
    showOnlyLast7Days: false,
    sortHighPriorityFirst: true,
    theme: 'system',
};

/**
 * Settings Store
 * 
 * Manages user preferences (persisted to localStorage) and backend configuration
 */
export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            // Initial state
            preferences: defaultPreferences,
            backendInfo: null,
            loading: false,
            error: null,

            /**
             * Load settings from API and localStorage
             * Backend info is fetched from API, preferences from localStorage (via persist middleware)
             */
            loadSettings: async () => {
                set({ loading: true, error: null });

                try {
                    // Fetch backend configuration
                    const backendInfo = await SettingsApi.getBackendInfo();

                    set({
                        backendInfo,
                        loading: false,
                    });

                    // Note: User preferences are loaded from localStorage automatically
                    // by the persist middleware. If we want to sync with backend in the future,
                    // we can call SettingsApi.getUserPreferences() here.
                } catch (error) {
                    const message = error instanceof ApiError ? error.getUserMessage() : (error as Error).message;
                    set({
                        error: message,
                        loading: false,
                    });
                }
            },

            /**
             * Update user preferences
             * Changes are automatically persisted to localStorage via persist middleware
             */
            updatePreferences: (partial: Partial<UserPreferences>) => {
                set((state) => ({
                    preferences: {
                        ...state.preferences,
                        ...partial,
                    },
                }));

                // Future enhancement: Sync to backend
                // SettingsApi.updateUserPreferences(get().preferences);
            },

            /**
             * Set theme mode
             * Convenience method for updating just the theme
             */
            setTheme: (theme: ThemeMode) => {
                get().updatePreferences({ theme });
            },

            /**
             * Clear error state
             */
            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'tube-digest-settings', // localStorage key
            partialize: (state: SettingsState) => ({
                // Only persist preferences, not backend info or loading states
                preferences: state.preferences,
            }),
        }
    )
);
