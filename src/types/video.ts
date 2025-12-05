import type { Priority, VideoStatus } from './enums';

export interface VideoSummary {
    id: string;
    youtubeVideoId: string;
    channelId: string;
    channelName: string;
    title: string;
    description?: string;
    durationSeconds?: number;
    publishedAt: string;
    addedAt: string;
    shortSummary?: string;
    mediumSummary?: string;
    fullSummary?: string;
    keyIdeas?: string[];
    priority: Priority;
    status: VideoStatus;
    category?: string;
    thumbnailUrl?: string;
}
