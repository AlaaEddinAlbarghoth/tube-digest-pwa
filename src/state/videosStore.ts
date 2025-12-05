import { create } from 'zustand';
import { VideosApi } from '@/api/videosApi';
import { ApiError } from '@/api/client';
import type { VideoSummary } from '@/types/video';
import type { DateRangeKey, Priority, VideoStatus } from '@/types/enums';

/**
 * Video filters state
 */
interface VideoFilters {
    dateRange: DateRangeKey;
    status: 'all' | VideoStatus;
    priority: 'all' | Priority;
    category: 'all' | string;
    channelId: 'all' | string;
    search: string;
}

/**
 * Videos store state interface
 */
interface VideosState {
    // State
    videos: Record<string, VideoSummary>;
    videoIds: string[];
    loading: boolean;
    error: string | null;
    filters: VideoFilters;
    hasMore: boolean;
    currentPage: number;

    // Actions
    fetchVideos: () => Promise<void>;
    fetchNextPage: () => Promise<void>;
    setFilters: (partial: Partial<VideoFilters>) => void;
    markAsRead: (videoId: string) => Promise<void>;
    clearError: () => void;
}

/**
 * Default filters
 */
const defaultFilters: VideoFilters = {
    dateRange: '3d',
    status: 'all',
    priority: 'all',
    category: 'all',
    channelId: 'all',
    search: '',
};

/**
 * Videos Store
 * 
 * Manages video list, filters, and read status
 */
export const useVideosStore = create<VideosState>((set, get) => ({
    // Initial state
    videos: {},
    videoIds: [],
    loading: false,
    error: null,
    filters: defaultFilters,
    hasMore: false,
    currentPage: 0,

    /**
     * Fetch videos based on current filters
     */
    fetchVideos: async () => {
        const { filters } = get();

        set({ loading: true, error: null, currentPage: 0 });

        try {
            const videos = await VideosApi.getVideos({
                range: filters.dateRange,
                status: filters.status !== 'all' ? filters.status : undefined,
                priority: filters.priority !== 'all' ? filters.priority : undefined,
                channelId: filters.channelId !== 'all' ? filters.channelId : undefined,
                category: filters.category !== 'all' ? filters.category : undefined,
            });

            // Filter by search locally if needed
            let filteredVideos = videos;
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredVideos = videos.filter(
                    (v) =>
                        v.title.toLowerCase().includes(searchLower) ||
                        v.channelName.toLowerCase().includes(searchLower) ||
                        v.description?.toLowerCase().includes(searchLower)
                );
            }

            // Convert to map
            const videosMap: Record<string, VideoSummary> = {};
            const videoIds: string[] = [];

            filteredVideos.forEach((video) => {
                videosMap[video.id] = video;
                videoIds.push(video.id);
            });

            set({
                videos: videosMap,
                videoIds,
                loading: false,
                hasMore: false, // Backend doesn't support pagination yet
                currentPage: 1,
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
     * Fetch next page of videos (for future pagination support)
     */
    fetchNextPage: async () => {
        const { hasMore, loading, currentPage } = get();

        if (!hasMore || loading) return;

        set({ loading: true, error: null });

        try {
            // TODO: Implement pagination when backend supports it
            // For now, this is a placeholder
            set({
                loading: false,
                currentPage: currentPage + 1,
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
     * Update filters and refetch
     */
    setFilters: (partial: Partial<VideoFilters>) => {
        set((state) => ({
            filters: { ...state.filters, ...partial },
        }));

        // Automatically refetch when filters change
        get().fetchVideos();
    },

    /**
     * Mark a video as read
     */
    markAsRead: async (videoId: string) => {
        try {
            await VideosApi.markVideoRead(videoId);

            // Update local state
            set((state) => ({
                videos: {
                    ...state.videos,
                    [videoId]: {
                        ...state.videos[videoId],
                        status: 'read',
                    },
                },
            }));
        } catch (error) {
            const message = error instanceof ApiError ? error.getUserMessage() : (error as Error).message;
            set({ error: message });
        }
    },

    /**
     * Clear error state
     */
    clearError: () => {
        set({ error: null });
    },
}));
