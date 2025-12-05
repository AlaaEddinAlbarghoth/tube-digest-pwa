import { create } from 'zustand';
import { LogsApi } from '@/api/logsApi';
import { ApiError } from '@/api/client';
import type { RunLog } from '@/types/run';

/**
 * Logs store state interface
 */
interface LogsState {
    // State
    lastRunSummary: RunLog | null;
    logs: RunLog[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    currentLimit: number;

    // Actions
    fetchSummary: () => Promise<void>;
    fetchLogs: (limit?: number) => Promise<void>;
    fetchNextPage: () => Promise<void>;
    clearError: () => void;
}

const DEFAULT_LIMIT = 10;
const PAGE_SIZE = 10;

/**
 * Activity Logs Store
 * 
 * Manages activity run logs and summaries
 */
export const useLogsStore = create<LogsState>((set, get) => ({
    // Initial state
    lastRunSummary: null,
    logs: [],
    loading: false,
    error: null,
    hasMore: false,
    currentLimit: DEFAULT_LIMIT,

    /**
     * Fetch summary of the most recent run
     */
    fetchSummary: async () => {
        set({ loading: true, error: null });

        try {
            const summary = await LogsApi.getRunSummary();

            set({
                lastRunSummary: summary,
                loading: false,
            });
        } catch (error) {
            const message = error instanceof ApiError ? error.getUserMessage() : (error as Error).message;
            set({
                error: message,
                loading: false,
            });
        }
    },

    /**
     * Fetch activity logs with optional limit
     */
    fetchLogs: async (limit = DEFAULT_LIMIT) => {
        set({ loading: true, error: null, currentLimit: limit });

        try {
            const response = await LogsApi.getRunLogs({ limit });

            set({
                lastRunSummary: response.lastRun,
                logs: response.runs,
                loading: false,
                hasMore: response.runs.length >= limit, // Assume more if we got full page
            });
        } catch (error) {
            const message = error instanceof ApiError ? error.getUserMessage() : (error as Error).message;
            set({
                error: message,
                loading: false,
            });
        }
    },

    /**
     * Fetch next page of logs
     */
    fetchNextPage: async () => {
        const { hasMore, loading, currentLimit } = get();

        if (!hasMore || loading) return;

        const newLimit = currentLimit + PAGE_SIZE;

        set({ loading: true, error: null, currentLimit: newLimit });

        try {
            const response = await LogsApi.getRunLogs({ limit: newLimit });

            set({
                lastRunSummary: response.lastRun,
                logs: response.runs,
                loading: false,
                hasMore: response.runs.length >= newLimit,
            });
        } catch (error) {
            const message = error instanceof ApiError ? error.getUserMessage() : (error as Error).message;
            set({
                error: message,
                loading: false,
            });
        }
    },

    /**
     * Clear error state
     */
    clearError: () => {
        set({ error: null });
    },
}));
