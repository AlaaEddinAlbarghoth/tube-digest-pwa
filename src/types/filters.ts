import type { Priority, VideoStatus, DateRangeKey } from './enums';

export interface DigestFilters {
    dateRange: Extract<DateRangeKey, 'today' | '3d' | '7d'>;
    status: 'all' | VideoStatus;
    priority: 'all' | Priority;
    category: 'all' | string;
}

export interface VideosFilters {
    dateRange: Extract<DateRangeKey, '7d' | '14d' | '30d'>;
    status: 'all' | VideoStatus;
    priority: 'all' | Priority;
    channelId: 'all' | string;
    category: 'all' | string;
}

export interface ChannelsFilters {
    onlyWithNewVideos: boolean;
    searchQuery: string;
}
