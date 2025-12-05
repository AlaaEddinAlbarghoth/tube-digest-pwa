import { get } from './client';
import type { RunLog } from '@/types/run';

/**
 * Query parameters for fetching activity logs
 */
export interface LogsQuery {
    limit?: number;
}

/**
 * Response from listRuns API containing the most recent run and history
 */
interface ListRunsResponse {
    lastRun: RunLog | null;
    runs: RunLog[];
}

/**
 * Activity Logs API client
 */
export const LogsApi = {
    /**
     * Fetch summary of the most recent run
     * 
     * @returns The most recent run log or null
     */
    async getRunSummary(): Promise<RunLog | null> {
        const response = await get<ListRunsResponse>('listRuns', { limit: 1 });
        return response.lastRun;
    },

    /**
     * Fetch activity run logs with optional limit
     * 
     * @param params - Query parameters including optional limit
     * @returns Object containing lastRun and array of historical runs
     */
    async getRunLogs(params?: LogsQuery): Promise<ListRunsResponse> {
        return get<ListRunsResponse>('listRuns', params as unknown as Record<string, number>);
    },
};
