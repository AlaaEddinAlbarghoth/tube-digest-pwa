import { get, post } from './client';
import type { VideoSummary } from '@/types/video';
import type { DateRangeKey, Priority, VideoStatus } from '@/types/enums';

/**
 * Query parameters for listing videos
 */
export interface VideosQuery {
    range: DateRangeKey;
    status?: VideoStatus;
    priority?: Priority;
    channelId?: string;
    category?: string;
}

/**
 * Response from listVideos API
 */
interface ListVideosResponse {
    videos: VideoSummary[];
}

/**
 * Response from getVideo API
 */
interface GetVideoResponse {
    video: VideoSummary;
}

/**
 * Response from markVideoRead API
 */
interface MarkVideoReadResponse {
    success: boolean;
}

/**
 * Videos API client
 */
export const VideosApi = {
    /**
     * Fetch list of videos with optional filters
     * 
     * @param params - Query parameters including date range and filters
     * @returns Array of video summaries
     */
    async getVideos(params: VideosQuery): Promise<VideoSummary[]> {
        const response = await get<ListVideosResponse>(
            'listVideos',
            params as unknown as Record<string, string>
        );
        return response.videos;
    },

    /**
     * Fetch single video details by ID
     * 
     * @param videoId - Unique video identifier
     * @returns Video summary with full details
     */
    async getVideoDetails(videoId: string): Promise<VideoSummary> {
        const response = await get<GetVideoResponse>('getVideo', { videoId });
        return response.video;
    },

    /**
     * Mark a video as read
     * 
     * @param videoId - Video ID to mark as read
     * @returns Success status
     */
    async markVideoRead(videoId: string): Promise<boolean> {
        const response = await post<MarkVideoReadResponse>('markVideoRead', { videoId });
        return response.success;
    },
};
