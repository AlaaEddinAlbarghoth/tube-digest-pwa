import type { VideoSummary } from '@/types/video';

/**
 * Determine if a video is missing all summaries
 * Considers short, medium, and full summaries.
 */
export function isVideoMissingSummaries(video: VideoSummary): boolean {
    const fields = [video.shortSummary, video.mediumSummary, video.fullSummary];
    return fields.every((f) => {
        if (!f) return true;
        return f.trim().length === 0;
    });
}

