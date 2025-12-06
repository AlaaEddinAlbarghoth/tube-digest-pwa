import { create } from 'zustand';
import { VideosApi } from '@/api/videosApi';
import { ApiError } from '@/api/client';
import type { VideoSummary } from '@/types/video';
import type { DateRangeKey, Priority, VideoStatus } from '@/types/enums';
import type { UnifiedFilters } from '@/types/filters';

/**
 * Video filters state
 * Uses null for "All" semantics - null means don't filter by this field
 */
interface VideoFilters {
    dateRange: DateRangeKey; // Always required
    status: VideoStatus | null; // null = All
    priority: Priority | null; // null = All
    category: string | null; // null = All
    channelId: string | null; // null = All
    search: string; // Empty string = no search
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
    setDateRange: (range: DateRangeKey) => void;
    setStatus: (status: VideoStatus | null) => void;
    setCategory: (category: string | null) => void;
    setPriority: (priority: Priority | null) => void;
    resetFilters: () => void;
    markAsRead: (videoId: string) => Promise<void>;
    clearError: () => void;
}

/**
 * Get default filters
 * dateRange can be overridden by backendInfo.defaultRange
 */
const getDefaultFilters = (defaultRange?: string): VideoFilters => {
    // Parse defaultRange (e.g., "3d") or fallback to "3d"
    const range = (defaultRange && defaultRange.endsWith('d')) 
        ? defaultRange as DateRangeKey 
        : '3d';
    
    return {
        dateRange: range,
        status: null, // All
        priority: null, // All
        category: null, // All
        channelId: null, // All
        search: '',
    };
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
    filters: getDefaultFilters(), // Will be updated when backendInfo loads
    hasMore: false,
    currentPage: 0,

    /**
     * Fetch videos based on current filters
     * Clears existing list and resets pagination before fetching
     */
    fetchVideos: async () => {
        const { filters } = get();

        // Clear existing data and reset pagination
        set({ 
            loading: true, 
            error: null, 
            currentPage: 0,
            videos: {},
            videoIds: [],
            hasMore: false
        });

        try {
            // Build query - only include non-null filters
            const query: Parameters<typeof VideosApi.getVideos>[0] = {
                range: filters.dateRange,
            };
            
            if (filters.status !== null) {
                query.status = filters.status;
            }
            if (filters.priority !== null) {
                query.priority = filters.priority;
            }
            if (filters.channelId !== null) {
                query.channelId = filters.channelId;
            }
            if (filters.category !== null) {
                query.category = filters.category;
            }

            const videos = await VideosApi.getVideos(query);

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
     * Clears list and resets pagination to prevent stale data
     */
    setFilters: (partial: Partial<VideoFilters>) => {
        set((state) => ({
            filters: { ...state.filters, ...partial },
            // Clear list when filters change to prevent stale data
            videos: {},
            videoIds: [],
            currentPage: 0,
            hasMore: false,
        }));

        // Automatically refetch when filters change
        get().fetchVideos();
    },

    /**
     * Set date range filter
     */
    setDateRange: (range: DateRangeKey) => {
        get().setFilters({ dateRange: range });
    },

    /**
     * Set status filter (null for All)
     */
    setStatus: (status: VideoStatus | null) => {
        get().setFilters({ status });
    },

    /**
     * Set category filter (null for All)
     */
    setCategory: (category: string | null) => {
        get().setFilters({ category });
    },

    /**
     * Set priority filter (null for All)
     */
    setPriority: (priority: Priority | null) => {
        get().setFilters({ priority });
    },

    /**
     * Reset all filters to defaults
     */
    resetFilters: () => {
        const defaultFilters = getDefaultFilters();
        get().setFilters(defaultFilters);
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
