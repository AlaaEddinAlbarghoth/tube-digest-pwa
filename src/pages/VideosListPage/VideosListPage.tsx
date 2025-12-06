import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideosStore } from '@/state/videosStore';
import { useChannelsStore } from '@/state/channelsStore';
import { useSettingsStore } from '@/state/settingsStore';
import { useSettingsStore } from '@/state/settingsStore';
import { VideoCard } from '@/components/features/VideoCard';
import { Chip } from '@/components/shared/Chip';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/shared/Button';
import type { DateRangeKey, Priority, VideoStatus } from '@/types/enums';

export function VideosListPage() {
    const navigate = useNavigate();
    const {
        videos,
        videoIds,
        loading,
        error,
        filters,
        hasMore,
        fetchVideos,
        fetchNextPage,
        setFilters
    } = useVideosStore();

    const { channels, channelIds, fetchChannels } = useChannelsStore();
    const { backendInfo } = useSettingsStore();

    useEffect(() => {
        fetchVideos();
        fetchChannels();
    }, [fetchVideos, fetchChannels]);

    const filteredVideos = videoIds.map(id => videos[id]);

    const dateRanges: { label: string; value: DateRangeKey }[] = [
        { label: 'Today', value: 'today' },
        { label: '3 Days', value: '3d' },
        { label: 'Week', value: '7d' },
        { label: '2 Weeks', value: '14d' },
        { label: 'Month', value: '30d' },
    ];

    const statuses: { label: string; value: VideoStatus | null }[] = [
        { label: 'All', value: null },
        { label: 'New', value: 'new' },
        { label: 'Processed', value: 'processed' },
        { label: 'Read', value: 'read' },
    ];

    // Get backend info for dynamic categories and priorities
    const { backendInfo } = useSettingsStore();

    // Dynamic priorities from backend
    const priorities: { label: string; value: Priority | null }[] = [
        { label: 'All', value: null },
        ...(backendInfo?.allowedPriorities && backendInfo.allowedPriorities.length > 0
            ? backendInfo.allowedPriorities.map((p) => ({
                label: p.charAt(0).toUpperCase() + p.slice(1), // Capitalize first letter
                value: p as Priority
            }))
            : [
                { label: 'High', value: 'high' as Priority },
                { label: 'Medium', value: 'medium' as Priority },
                { label: 'Low', value: 'low' as Priority }
            ]) // Fallback to default if backend info not available
    ];
    
    // Dynamic categories from backend
    const categories: { label: string; value: string | null }[] = [
        { label: 'All', value: null },
        ...(backendInfo?.allowedCategories && backendInfo.allowedCategories.length > 0
            ? backendInfo.allowedCategories.map((cat) => ({ label: cat, value: cat }))
            : [])
    ];

    const handleOpenYouTube = (youtubeVideoId: string) => {
        window.open(`https://youtube.com/watch?v=${youtubeVideoId}`, '_blank');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Search */}
            <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-950 p-4 border-b border-gray-200 dark:border-gray-800">
                <input
                    type="search"
                    placeholder="Search videos..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                />
            </div>

            {/* Filters */}
            <div className="sticky top-[73px] z-10 bg-gray-50 dark:bg-gray-950 py-3 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                <div className="px-4 space-y-2">
                    {/* Date Range */}
                    <div className="flex items-center gap-2 min-w-max">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date:</span>
                        {dateRanges.map((r) => (
                            <Chip
                                key={r.value}
                                label={r.label}
                                isActive={filters.dateRange === r.value}
                                onClick={() => setFilters({ dateRange: r.value })}
                            />
                        ))}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 min-w-max">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status:</span>
                        {statuses.map((s) => (
                            <Chip
                                key={s.value ?? 'all'}
                                label={s.label}
                                isActive={filters.status === s.value}
                                onClick={() => setFilters({ status: s.value })}
                            />
                        ))}
                    </div>

                    {/* Priority */}
                    <div className="flex items-center gap-2 min-w-max">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority:</span>
                        {priorities.map((p) => (
                            <Chip
                                key={p.value ?? 'all'}
                                label={p.label}
                                isActive={filters.priority === p.value}
                                onClick={() => setFilters({ priority: p.value })}
                            />
                        ))}
                    </div>

                    {/* Channel */}
                    {channelIds.length > 0 && (
                        <div className="flex items-center gap-2 min-w-max overflow-x-auto">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel:</span>
                            <Chip
                                label="All"
                                isActive={filters.channelId === null}
                                onClick={() => setFilters({ channelId: null })}
                            />
                            {channelIds.slice(0, 5).map((id) => (
                                <Chip
                                    key={id}
                                    label={channels[id].name}
                                    isActive={filters.channelId === id}
                                    onClick={() => setFilters({ channelId: id })}
                                />
                            ))}
                        </div>
                    )}

                    {/* Category filters */}
                    {categories.length > 1 && (
                        <div className="flex items-center gap-2 min-w-max overflow-x-auto">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category:</span>
                            {categories.map((c) => (
                                <Chip
                                    key={c.value ?? 'all'}
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
                {loading && filteredVideos.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <EmptyState
                        title="Error loading videos"
                        description={error}
                        action={<Button onClick={() => fetchVideos()}>Retry</Button>}
                    />
                ) : filteredVideos.length > 0 ? (
                    <div className="space-y-4 pb-4">
                        {filteredVideos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onOpenDetails={() => navigate(`/videos/${video.id}`)}
                                onOpenYouTube={() => handleOpenYouTube(video.youtubeVideoId)}
                            />
                        ))}

                        {hasMore && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={fetchNextPage}
                                isLoading={loading}
                            >
                                Load More
                            </Button>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        icon="🔍"
                        title="No videos found"
                        description={filters.search ? `No results for "${filters.search}"` : "لا توجد فيديوهات ضمن هذه الفلاتر"}
                    />
                )}
            </div>
        </div>
    );
}
