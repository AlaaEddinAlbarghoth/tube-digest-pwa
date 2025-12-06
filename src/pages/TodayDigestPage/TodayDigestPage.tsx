import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideosStore } from '@/state/videosStore';
import { useSettingsStore } from '@/state/settingsStore';
import { VideoCard } from '@/components/features/VideoCard';
import { Chip } from '@/components/shared/Chip';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/shared/Button';
import type { DateRangeKey, Priority, VideoStatus } from '@/types/enums';

type TabValue = 'today' | '3d' | '7d';

export function TodayDigestPage() {
    const navigate = useNavigate();
    const {
        videos,
        videoIds,
        loading,
        error,
        filters,
        fetchVideos,
        setFilters
    } = useVideosStore();

    const { backendInfo, loadSettings } = useSettingsStore();

    const [activeTab, setActiveTab] = useState<TabValue>('7d');

    // Sync tab with dateRange filter
    useEffect(() => {
        setFilters({ dateRange: activeTab as DateRangeKey });
    }, [activeTab, setFilters]);

    useEffect(() => {
        fetchVideos();
        loadSettings();
    }, [fetchVideos, loadSettings]);

    const filteredVideos = videoIds.map(id => videos[id]);

    const tabs: { label: string; value: TabValue }[] = [
        { label: '7 Days', value: '7d' },
        { label: '3 Days', value: '3d' },
        { label: 'Today', value: 'today' },
    ];

    const statuses: { label: string; value: 'all' | VideoStatus }[] = [
        { label: 'All', value: 'all' },
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
    ];

    // Dynamic priorities from backend
    const priorities: { label: string; value: 'all' | Priority }[] = [
        { label: 'All', value: 'all' },
        ...(backendInfo?.allowedPriorities && backendInfo.allowedPriorities.length > 0
            ? backendInfo.allowedPriorities.map((p) => ({
                label: p.charAt(0).toUpperCase() + p.slice(1), // Capitalize first letter
                value: p as Priority
            }))
            : [
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' }
            ]) // Fallback to default if backend info not available
    ];

    // Dynamic categories from backend
    const categories: { label: string; value: 'all' | string }[] = [
        { label: 'All', value: 'all' },
        ...(backendInfo?.allowedCategories && backendInfo.allowedCategories.length > 0
            ? backendInfo.allowedCategories.map((cat) => ({ label: cat, value: cat }))
            : [])
    ];

    const handleOpenYouTube = (youtubeVideoId: string) => {
        window.open(`https://youtube.com/watch?v=${youtubeVideoId}`, '_blank');
    };

    if (error) {
        return (
            <div className="p-4">
                <EmptyState
                    title="Something went wrong"
                    description={error}
                    action={
                        <Button onClick={() => fetchVideos()} variant="primary">
                            Try Again
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.value
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.value && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="sticky top-[49px] z-10 bg-gray-50 dark:bg-gray-950 py-3 border-b border-gray-200 dark:border-gray-800">
                <div className="px-4 space-y-2">
                    {/* Status filters */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Status:</span>
                        {statuses.map((s) => (
                            <Chip
                                key={s.value}
                                label={s.label}
                                isActive={filters.status === s.value}
                                onClick={() => setFilters({ status: s.value })}
                            />
                        ))}
                    </div>

                    {/* Priority filters */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Priority:</span>
                        {priorities.map((p) => (
                            <Chip
                                key={p.value}
                                label={p.label}
                                isActive={filters.priority === p.value}
                                onClick={() => setFilters({ priority: p.value })}
                            />
                        ))}
                    </div>

                    {/* Category filters */}
                    {categories.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Category:</span>
                            {categories.map((c) => (
                                <Chip
                                    key={c.value}
                                    label={c.label}
                                    isActive={filters.category === c.value}
                                    onClick={() => setFilters({ category: c.value })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Video List */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Freshness Hint */}
                {backendInfo?.windowStatus3d && (
                    <div className="mb-3 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <span>
                                Window {backendInfo.videosWindowDays || 3}d. New in window: <span className={`font-medium ${backendInfo.windowStatus3d.newInWindow > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>{backendInfo.windowStatus3d.newInWindow}</span>
                            </span>
                            {backendInfo.lastSuccessfulRunAt && (
                                <span className="text-gray-400 dark:text-gray-500">
                                    Last run: {new Date(backendInfo.lastSuccessfulRunAt).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {loading && filteredVideos.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : filteredVideos.length > 0 ? (
                    <div className="space-y-4">
                        {filteredVideos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onOpenDetails={() => navigate(`/videos/${video.id}`)}
                                onOpenYouTube={() => handleOpenYouTube(video.youtubeVideoId)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="📭"
                        title="No videos found"
                        description="Try adjusting your filters or check back later for new summaries."
                        action={
                            <Button onClick={() => fetchVideos()} variant="outline" size="sm">
                                Refresh
                            </Button>
                        }
                    />
                )}
            </div>
        </div>
    );
}
