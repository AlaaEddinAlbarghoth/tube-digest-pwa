import { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideosStore } from '@/state/videosStore';
import { useChannelsStore } from '@/state/channelsStore';
import { useSettingsStore } from '@/state/settingsStore';
import { VideoCard } from '@/components/features/VideoCard';
import { VideoPreview } from '@/components/features/VideoPreview';
import { Chip } from '@/components/shared/Chip';
import { FiltersPanel } from '@/components/shared/FiltersPanel';
import { EmptyState } from '@/components/shared/EmptyState';
import { VideoCardSkeleton } from '@/components/shared/VideoCardSkeleton';
import { Button } from '@/components/shared/Button';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useDebounce } from '@/hooks/useDebounce';
import { sortVideos } from '@/utils/sortVideos';
import type { DateRangeKey, Priority, VideoStatus } from '@/types/enums';
import type { VideoSummary } from '@/types/video';

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
        setFilters,
        setSort,
        setStatus,
        setPriority,
        setCategory,
        resetFilters,
        lastUpdated,
        totalMatching
    } = useVideosStore();

    const { channels, channelIds, fetchChannels } = useChannelsStore();
    // Get backend info for dynamic categories and priorities
    const { backendInfo } = useSettingsStore();

    const [searchInput, setSearchInput] = useState(filters.search);
    const [selectedVideo, setSelectedVideo] = useState<VideoSummary | null>(null);
    const debouncedSearch = useDebounce(searchInput, 200);

    // Sync debounced search to store
    useEffect(() => {
        if (debouncedSearch !== filters.search) {
            setFilters({ search: debouncedSearch });
        }
    }, [debouncedSearch, filters.search, setFilters]);

    // Sync store search to input (for external changes)
    useEffect(() => {
        if (filters.search !== searchInput) {
            setSearchInput(filters.search);
        }
    }, [filters.search]);

    useEffect(() => {
        fetchVideos();
        fetchChannels();
    }, [fetchVideos, fetchChannels]);

    // Auto-refresh callback - preserves list and uses abort signal
    const refreshVideos = useCallback(
        (signal: AbortSignal) => {
            return fetchVideos(signal, true); // preserveList = true
        },
        [fetchVideos]
    );

    // Enable auto-refresh when page is mounted and visible
    useAutoRefresh(refreshVideos, true);

    // Filter and sort videos locally - memoized to avoid unnecessary re-computation
    // This is a single derived list that combines search filter and sort
    const filteredVideos = useMemo(() => {
        const videoList = videoIds
            .map(id => videos[id])
            .filter((video) => {
                if (!filters.search) return true;
                const searchLower = filters.search.toLowerCase();
                return (
                    video.title.toLowerCase().includes(searchLower) ||
                    video.channelName.toLowerCase().includes(searchLower)
                );
            });
        return sortVideos(videoList, filters.sort);
    }, [videoIds, videos, filters.search, filters.sort]);

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
                    placeholder="ابحث في الفيديوهات... / Search videos..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="sticky top-[73px] z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                {/* Loaded count indicator (Arabic) - compact chip */}
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {loading && (
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{filteredVideos.length}</span>
                            {' / '}
                            <span>{totalMatching !== null ? totalMatching : '--'}</span>
                        </span>
                    </div>
                    {lastUpdated && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            آخر تحديث: <span className="ltr-text font-medium">{lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                    )}
                </div>
                
                {/* Sort control */}
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Sort:</span>
                        <Chip
                            label="Newest"
                            isActive={filters.sort === 'newest'}
                            onClick={() => setSort('newest')}
                        />
                        <Chip
                            label="Oldest"
                            isActive={filters.sort === 'oldest'}
                            onClick={() => setSort('oldest')}
                        />
                        <Chip
                            label="Longest"
                            isActive={filters.sort === 'duration-longest'}
                            onClick={() => setSort('duration-longest')}
                        />
                        <Chip
                            label="Shortest"
                            isActive={filters.sort === 'duration-shortest'}
                            onClick={() => setSort('duration-shortest')}
                        />
                        <Chip
                            label="Priority"
                            isActive={filters.sort === 'priority-high'}
                            onClick={() => setSort('priority-high')}
                        />
                    </div>
                </div>

                {/* Date Range - always visible */}
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Date:</span>
                        {dateRanges.map((r) => (
                            <Chip
                                key={r.value}
                                label={r.label}
                                isActive={filters.dateRange === r.value}
                                onClick={() => setFilters({ dateRange: r.value })}
                            />
                        ))}
                    </div>
                </div>

                {/* Channel - always visible if available */}
                {channelIds.length > 0 && (
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Channel:</span>
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
                    </div>
                )}

                {/* Filters Panel */}
                <FiltersPanel
                    statuses={statuses}
                    priorities={priorities}
                    categories={categories}
                    activeStatus={filters.status}
                    activePriority={filters.priority}
                    activeCategory={filters.category}
                    onStatusChange={setStatus}
                    onPriorityChange={setPriority}
                    onCategoryChange={setCategory}
                    onReset={resetFilters}
                />
            </div>

            {/* Video List - Desktop two-column layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* List Column */}
                <div className="flex-1 overflow-y-auto p-4 lg:border-r lg:border-gray-200 lg:dark:border-gray-800">
                {loading && filteredVideos.length === 0 ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <VideoCardSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <EmptyState
                        icon="⚠️"
                        title="Error loading videos"
                        description={error}
                        action={
                            <Button onClick={() => fetchVideos()} variant="primary">
                                Retry
                            </Button>
                        }
                    />
                ) : filteredVideos.length > 0 ? (
                    <div className="space-y-4 pb-4">
                        {filteredVideos.map((video) => (
                            <div
                                key={video.id}
                                onClick={() => setSelectedVideo(video)}
                                className={`cursor-pointer transition-all ${
                                    selectedVideo?.id === video.id
                                        ? 'ring-2 ring-blue-500 rounded-xl'
                                        : ''
                                }`}
                            >
                                <VideoCard
                                    video={video}
                                    onOpenDetails={() => {
                                        setSelectedVideo(video);
                                        if (window.innerWidth < 1024) {
                                            navigate(`/videos/${video.id}`);
                                        }
                                    }}
                                    onOpenYouTube={() => handleOpenYouTube(video.youtubeVideoId)}
                                />
                            </div>
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
                        title={filters.search ? "No results found" : "No videos found"}
                        description={filters.search 
                            ? `No videos match "${filters.search}". Try adjusting your search or filters.`
                            : "Try adjusting your filters or check back later for new summaries."
                        }
                        action={
                            filters.search ? (
                                <Button onClick={() => setFilters({ search: '' })} variant="outline" size="sm">
                                    Clear Search
                                </Button>
                            ) : (
                                <Button onClick={() => fetchVideos()} variant="outline" size="sm">
                                    Refresh
                                </Button>
                            )
                        }
                    />
                )}
                </div>

                {/* Preview Column - Desktop only */}
                <div className="hidden lg:block lg:w-96 flex-shrink-0">
                    <VideoPreview
                        video={selectedVideo}
                        onOpenDetails={() => {
                            if (selectedVideo) {
                                navigate(`/videos/${selectedVideo.id}`);
                            }
                        }}
                        onOpenYouTube={() => {
                            if (selectedVideo) {
                                handleOpenYouTube(selectedVideo.youtubeVideoId);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
