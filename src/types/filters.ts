import type { Priority, VideoStatus, DateRangeKey } from './enums';

/**
 * Unified filter interface using null for "All" semantics
 * null means "show all" - do not send to API
 */
export interface UnifiedFilters {
    dateRange: DateRangeKey; // Always required, never null
    status: VideoStatus | null; // null = All
    priority: Priority | null; // null = All
    category: string | null; // null = All
    channelId: string | null; // null = All
    search: string; // Empty string = no search
}

export interface DigestFilters {
    dateRange: Extract<DateRangeKey, 'today' | '3d' | '7d'>;
    status: VideoStatus | null;
    priority: Priority | null;
    category: string | null;
}

export interface VideosFilters {
    dateRange: Extract<DateRangeKey, '7d' | '14d' | '30d'>;
    status: VideoStatus | null;
    priority: Priority | null;
    channelId: string | null;
    category: string | null;
    search: string;
}

export interface ChannelsFilters {
    onlyWithNewVideos: boolean;
    searchQuery: string;
}
