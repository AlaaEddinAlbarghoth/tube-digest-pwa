import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVideosStore } from '@/state/videosStore';
import { VideosApi } from '@/api/videosApi';
import type { VideoSummary } from '@/types/video';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Toggle } from '@/components/shared/Toggle';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDistanceToNow, format } from 'date-fns';
import { formatVideoDuration, capitalize } from '@/utils/formatters';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
                <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            {isOpen && (
                <div className="p-4 bg-white dark:bg-gray-900">
                    {children}
                </div>
            )}
        </div>
    );
}

export function VideoDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { videos, markAsRead } = useVideosStore();
    const [video, setVideo] = useState<VideoSummary | null>(id ? videos[id] || null : null);
    const [loading, setLoading] = useState(!video);
    const [error, setError] = useState<string | null>(null);
    const [actionItems, setActionItems] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!id) return;

        const loadVideo = async () => {
            try {
                setLoading(true);
                const details = await VideosApi.getVideoDetails(id);
                setVideo(details);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        if (!video) {
            loadVideo();
        }
    }, [id, video]);

    const handleMarkAsRead = async () => {
        if (!video) return;
        await markAsRead(video.id);
        setVideo(prev => prev ? { ...prev, status: 'read' } : null);
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500 mb-4">{error || 'Video not found'}</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    // Mock action items from key ideas for demo
    const mockActionItems = video.keyIdeas?.slice(0, 3) || [];

    return (
        <div className="pb-24">
            {/* Back button */}
            <div className="p-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon="←">
                    Back
                </Button>
            </div>

            {/* Thumbnail */}
            <div className="aspect-video bg-gray-900 relative">
                {video.thumbnailUrl ? (
                    <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <span className="text-6xl">🎬</span>
                    </div>
                )}
                {video.durationSeconds && (
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-sm px-2 py-1 rounded">
                        {formatVideoDuration(video.durationSeconds) || 'Unknown'}
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant={video.priority === 'high' ? 'error' : video.priority === 'medium' ? 'warning' : 'default'}>
                        {capitalize(video.priority)} Priority
                    </Badge>
                    {video.status === 'new' && <Badge variant="info">NEW</Badge>}
                    {video.status === 'read' && <Badge variant="success">READ</Badge>}
                    {video.category && <Badge variant="default"><span className="rtl-text">{video.category}</span></Badge>}
                </div>

                {/* Title */}
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight rtl-text">
                    {video.title}
                </h1>

                {/* Channel and metadata */}
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {video.channelName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-200 rtl-text">{video.channelName}</p>
                        <p className="ltr-text">
                            {format(new Date(video.publishedAt), 'MMM d, yyyy')} • {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => window.open(`https://youtube.com/watch?v=${video.youtubeVideoId}`, '_blank')}
                    >
                        🎬 Open in YouTube
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1"
                        disabled
                    >
                        ▶️ Play Here
                    </Button>
                </div>

                {/* Summaries */}
                <div className="space-y-3">
                    {video.shortSummary && (
                        <Accordion title="📝 Short Summary" defaultOpen>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap rtl-text">
                                {video.shortSummary}
                            </p>
                        </Accordion>
                    )}

                    {video.mediumSummary && (
                        <Accordion title="📄 Medium Summary">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap rtl-text">
                                {video.mediumSummary}
                            </p>
                        </Accordion>
                    )}

                    {video.fullSummary && (
                        <Accordion title="📚 Full Summary">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap rtl-text">
                                {video.fullSummary}
                            </p>
                        </Accordion>
                    )}

                    {video.keyIdeas && video.keyIdeas.length > 0 && (
                        <Accordion title="💡 Key Ideas">
                            <ul className="space-y-2 rtl-text">
                                {video.keyIdeas.map((idea, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span className="rtl-text">{idea}</span>
                                    </li>
                                ))}
                            </ul>
                        </Accordion>
                    )}

                    {mockActionItems.length > 0 && (
                        <Accordion title="✅ Action Items">
                            <ul className="space-y-3 rtl-text">
                                {mockActionItems.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={actionItems[idx] || false}
                                            onChange={(e) => setActionItems(prev => ({ ...prev, [idx]: e.target.checked }))}
                                            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className={`text-gray-700 dark:text-gray-300 rtl-text ${actionItems[idx] ? 'line-through opacity-60' : ''}`}>
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Accordion>
                    )}
                </div>

                {/* Mark as Read */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Toggle
                        checked={video.status === 'read'}
                        onChange={handleMarkAsRead}
                        label="Mark as Read"
                        description="سيتم وضع علامة على هذا الفيديو كمقروء وفلترته وفقًا لذلك"
                        disabled={video.status === 'read'}
                    />
                </div>
            </div>
        </div>
    );
}
