import type { VideoSummary } from '@/types/video';
import type { SortOption } from '@/state/videosStore';
import type { Priority } from '@/types/enums';

const priorityOrder: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
};

/**
 * Sort videos array based on sort option
 * Uses stable sort (preserves original order for equal items)
 */
export function sortVideos(videos: VideoSummary[], sortOption: SortOption): VideoSummary[] {
    const sorted = [...videos]; // Create copy to avoid mutating original

    switch (sortOption) {
        case 'newest':
            sorted.sort((a, b) => {
                const dateA = new Date(a.publishedAt).getTime();
                const dateB = new Date(b.publishedAt).getTime();
                if (dateB !== dateA) return dateB - dateA;
                // Stable sort: preserve original order for equal dates
                return 0;
            });
            break;

        case 'oldest':
            sorted.sort((a, b) => {
                const dateA = new Date(a.publishedAt).getTime();
                const dateB = new Date(b.publishedAt).getTime();
                if (dateA !== dateB) return dateA - dateB;
                return 0;
            });
            break;

        case 'duration-longest':
            sorted.sort((a, b) => {
                const durA = a.durationSeconds || 0;
                const durB = b.durationSeconds || 0;
                if (durB !== durA) return durB - durA;
                return 0;
            });
            break;

        case 'duration-shortest':
            sorted.sort((a, b) => {
                const durA = a.durationSeconds || 0;
                const durB = b.durationSeconds || 0;
                if (durA !== durB) return durA - durB;
                return 0;
            });
            break;

        case 'priority-high':
            sorted.sort((a, b) => {
                const priA = priorityOrder[a.priority] || 0;
                const priB = priorityOrder[b.priority] || 0;
                if (priB !== priA) return priB - priA;
                // Secondary sort by date (newest first)
                const dateA = new Date(a.publishedAt).getTime();
                const dateB = new Date(b.publishedAt).getTime();
                if (dateB !== dateA) return dateB - dateA;
                return 0;
            });
            break;

        default:
            // No sorting needed
            break;
    }

    return sorted;
}

