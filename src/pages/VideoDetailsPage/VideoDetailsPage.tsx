import { useEffect, useState, useMemo } from 'react';
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
import { bidiTextClass, bidiPlainClass } from '@/utils/bidi';
import { isVideoMissingSummaries } from '@/utils/videoFilters';

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
    const { videos, markAsRead, fetchVideos, loading: listLoading, lastUpdated, totalMatching, totalLoaded } = useVideosStore();
    const [video, setVideo] = useState<VideoSummary | null>(id ? videos[id] || null : null);
    const [loading, setLoading] = useState(!video);
    const [error, setError] = useState<string | null>(null);
    const [actionItems, setActionItems] = useState<Record<number, boolean>>({});
    const [refreshing, setRefreshing] = useState(false);

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
        // Optimistic update: update local state immediately
        setVideo(prev => prev ? { ...prev, status: 'read' } : null);
        // Store will also update optimistically, then sync with backend
        await markAsRead(video.id);
        // Sync with store after API call (in case store has more recent data)
        const storeVideo = videos[video.id];
        if (storeVideo) {
            setVideo(storeVideo);
        }
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
    const missingAllSummaries = useMemo(() => isVideoMissingSummaries(video), [video]);

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
                {/* Sticky header (desktop) */}
                <div className="lg:sticky lg:top-0 lg:z-10 lg:bg-gray-50 lg:dark:bg-gray-950 lg:pb-2 lg:border-b lg:border-gray-200 lg:dark:border-gray-800 lg:shadow-sm">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={video.priority === 'high' ? 'error' : video.priority === 'medium' ? 'warning' : 'default'}>
                            {capitalize(video.priority)} Priority
                        </Badge>
                        {video.status === 'new' && <Badge variant="info">NEW</Badge>}
                        {video.status === 'read' && <Badge variant="success">READ</Badge>}
                        {video.category && <Badge variant="default"><span className={bidiTextClass(video.category)}>{video.category}</span></Badge>}
                        {missingAllSummaries && (
                            <Badge variant="default">
                                <span className="rtl-text text-gray-700 dark:text-gray-300">بدون ملخص بعد</span>
                            </Badge>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className={`mt-3 text-xl font-bold text-gray-900 dark:text-white leading-tight ${bidiTextClass(video.title)}`}>
                        {video.title}
                    </h1>

                    {/* Summary state notice */}
                    {missingAllSummaries && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 rtl-text">
                            لا يوجد ملخص بعد
                        </div>
                    )}

                    {/* Channel and metadata */}
                    <div className="mt-3 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            {video.channelName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className={`font-medium text-gray-900 dark:text-gray-200 ${bidiTextClass(video.channelName)}`}>{video.channelName}</p>
                            <p className="ltr-text">
                                {format(new Date(video.publishedAt), 'MMM d, yyyy')} • {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    {/* Context + last updated + refresh */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {totalMatching !== null && totalLoaded !== undefined && (
                            <span className="rtl-text bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-800">
                                ضمن نتائج آخر تحميل: {totalLoaded} من {totalMatching}
                            </span>
                        )}
                        <div className="flex items-center gap-2">
                            <span>آخر تحديث: <span className="ltr-text font-medium">{lastUpdated ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span></span>
                            <button
                                onClick={async () => {
                                    try {
                                        setRefreshing(true);
                                        await fetchVideos(undefined, true);
                                    } finally {
                                        setRefreshing(false);
                                    }
                                }}
                                disabled={listLoading || refreshing}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Refresh"
                                aria-label="Refresh video list context"
                            >
                                {listLoading || refreshing ? (
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                            </button>
                        </div>
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
                    <Accordion title="📝 Short Summary" defaultOpen>
                        {video.shortSummary ? (
                            <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${bidiPlainClass(video.shortSummary)}`}>
                                {video.shortSummary}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-500 italic rtl-text">لا يوجد ملخص قصير متاح حالياً</p>
                        )}
                    </Accordion>

                    <Accordion title="📄 Medium Summary">
                        {video.mediumSummary ? (
                            <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${bidiPlainClass(video.mediumSummary)}`}>
                                {video.mediumSummary}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-500 italic rtl-text">لا يوجد ملخص متوسط متاح حالياً</p>
                        )}
                    </Accordion>

                    <Accordion title="📚 Full Summary">
                        {video.fullSummary ? (
                            <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${bidiPlainClass(video.fullSummary)}`}>
                                {video.fullSummary}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-500 italic rtl-text">لا يوجد ملخص كامل متاح حالياً</p>
                        )}
                    </Accordion>

                    {video.keyIdeas && video.keyIdeas.length > 0 && (
                        <Accordion title="💡 Key Ideas">
                            <ul className="space-y-2">
                                {video.keyIdeas.map((idea, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span className={bidiPlainClass(idea)}>{idea}</span>
                                    </li>
                                ))}
                            </ul>
                        </Accordion>
                    )}

                    {mockActionItems.length > 0 && (
                        <Accordion title="✅ Action Items">
                            <ul className="space-y-3">
                                {mockActionItems.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={actionItems[idx] || false}
                                            onChange={(e) => setActionItems(prev => ({ ...prev, [idx]: e.target.checked }))}
                                            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className={`text-gray-700 dark:text-gray-300 ${bidiPlainClass(item)} ${actionItems[idx] ? 'line-through opacity-60' : ''}`}>
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
