import type { RunStatus } from './enums';

export interface RunLog {
    id: string;
    startedAt: string;
    finishedAt?: string;
    status: RunStatus;
    error?: string;
    errorMessage?: string;
    videosProcessed: number;
    subscriptionsChecked?: number;
    channelsWithNewVideos?: number;
    duration?: number;
    stats?: {
        subscriptions: number;
        channelsProcessed: number;
        newVideosFound: number;
        durationSeconds: number;
    };
}
