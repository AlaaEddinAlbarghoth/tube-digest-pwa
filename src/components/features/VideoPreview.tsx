import { formatDistanceToNow } from 'date-fns';
import type { VideoSummary } from '@/types/video';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { formatVideoDuration, capitalize } from '@/utils/formatters';
import { bidiTextClass } from '@/utils/bidi';

interface VideoPreviewProps {
    video: VideoSummary | null;
    onOpenDetails: () => void;
    onOpenYouTube: () => void;
}

export function VideoPreview({ video, onOpenDetails, onOpenYouTube }: VideoPreviewProps) {
    if (!video) {
        return (
            <div className="h-full flex items-center justify-center p-8 text-center">
                <div className="text-gray-400 dark:text-gray-600">
                    <div className="text-4xl mb-2">👈</div>
                    <p className="text-sm">Select a video to preview</p>
                </div>
            </div>
        );
    }

    const priorityColors: Record<string, 'error' | 'warning' | 'default'> = {
        high: 'error',
        medium: 'warning',
        low: 'default',
    };

    return (
        <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
            <div className="p-6 space-y-4">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span className={`font-medium text-gray-700 dark:text-gray-300 ${bidiTextClass(video.channelName)}`}>
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

                    <h2 className={`text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight ${bidiTextClass(video.title)}`}>
                        {video.title}
                    </h2>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
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
                            <span className={`text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full ${bidiTextClass(video.category)}`}>
                                {video.category}
                            </span>
                        )}
                    </div>
                </div>

                {/* Summary */}
                {video.shortSummary && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Summary</h3>
                        <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${bidiTextClass(video.shortSummary)}`}>
                            {video.shortSummary}
                        </p>
                    </div>
                )}

                {/* Description */}
                {video.description && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                        <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-6 ${bidiTextClass(video.description)}`}>
                            {video.description}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onOpenYouTube}
                    >
                        🎬 YouTube
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1"
                        onClick={onOpenDetails}
                    >
                        📖 Full Details
                    </Button>
                </div>
            </div>
        </div>
    );
}

