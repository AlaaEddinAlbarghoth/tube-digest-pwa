import { formatDistanceToNow } from 'date-fns';
import type { VideoSummary } from '@/types/video';
import type { Priority } from '@/types/enums';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { formatVideoDuration, capitalize } from '@/utils/formatters';
import { bidiTextClass } from '@/utils/bidi';

interface VideoCardProps {
    video: VideoSummary;
    onOpenDetails: () => void;
    onOpenYouTube: () => void;
}

export function VideoCard({ video, onOpenDetails, onOpenYouTube }: VideoCardProps) {
    const priorityColors: Record<Priority, 'error' | 'warning' | 'default'> = {
        high: 'error',
        medium: 'warning',
        low: 'default',
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header with channel info */}
            <div className="p-4 pb-3 flex items-start gap-3">
                {/* Channel Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {video.channelName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Channel name and time */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`font-medium text-gray-700 dark:text-gray-300 truncate ${bidiTextClass(video.channelName)}`}>
                            {video.channelName}
                        </span>
                        <span>•</span>
                        <span className="whitespace-nowrap">
                            {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                        </span>
                        {video.durationSeconds && (
                            <>
                                <span>•</span>
                                <span>{formatVideoDuration(video.durationSeconds)}</span>
                            </>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className={`font-semibold text-gray-900 dark:text-white line-clamp-2 mt-1 leading-snug ${bidiTextClass(video.title)}`}>
                        {video.title}
                    </h3>
                </div>
            </div>

            {/* Badges row */}
            <div className="px-4 flex flex-wrap items-center gap-2">
                <Badge variant={priorityColors[video.priority]}>
                    {capitalize(video.priority)}
                </Badge>

                {video.status === 'new' && (
                    <Badge variant="info">NEW</Badge>
                )}
                {video.status === 'read' && (
                    <Badge variant="success">READ</Badge>
                )}

                {video.category && (
                    <span className={`text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full ${bidiTextClass(video.category)}`}>
                        {video.category}
                    </span>
                )}
            </div>

            {/* Excerpt */}
            {video.shortSummary && (
                <div className="px-4 pt-3">
                    <p className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ${bidiTextClass(video.shortSummary)}`}>
                        {video.shortSummary}
                    </p>
                </div>
            )}

            {/* Action buttons */}
            <div className="p-4 pt-3 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={onOpenYouTube}
                >
                    🎬 YouTube
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={onOpenDetails}
                >
                    📖 Details
                </Button>
            </div>
        </div>
    );
}
