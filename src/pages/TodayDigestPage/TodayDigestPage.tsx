import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideosStore } from '@/state/videosStore';
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
        setFilters,
        setSort,
        setStatus,
        setPriority,
        setCategory,
        resetFilters,
        lastUpdated,
        totalMatching
    } = useVideosStore();

    const { backendInfo, loadSettings } = useSettingsStore();

    const [activeTab, setActiveTab] = useState<TabValue>('7d');
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

    // Auto-refresh callback - preserves list and uses abort signal
    const refreshVideos = useCallback(
        (signal: AbortSignal) => {
            return fetchVideos(signal, true); // preserveList = true
        },
        [fetchVideos]
    );

    // Enable auto-refresh when page is mounted and visible
    useAutoRefresh(refreshVideos, true);

    // Sync tab with dateRange filter
    useEffect(() => {
        setFilters({ dateRange: activeTab as DateRangeKey });
    }, [activeTab, setFilters]);

    // Initialize dateRange from backendInfo when available
    useEffect(() => {
        if (backendInfo?.defaultRange && filters.dateRange !== backendInfo.defaultRange.replace('d', '') as DateRangeKey) {
            const defaultRange = backendInfo.defaultRange.replace('d', '') as DateRangeKey;
            setFilters({ dateRange: defaultRange });
        }
    }, [backendInfo?.defaultRange, setFilters]);

    useEffect(() => {
        fetchVideos();
        loadSettings();
    }, [fetchVideos, loadSettings]);

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

    const tabs: { label: string; value: TabValue }[] = [
        { label: '7 Days', value: '7d' },
        { label: '3 Days', value: '3d' },
        { label: 'Today', value: 'today' },
    ];

    const statuses: { label: string; value: VideoStatus | null }[] = [
        { label: 'All', value: null },
        { label: 'New', value: 'new' },
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

            {/* Search */}
            <div className="sticky top-[49px] z-19 bg-gray-50 dark:bg-gray-950 p-4 border-b border-gray-200 dark:border-gray-800">
                <input
                    type="search"
                    placeholder="ابحث في الفيديوهات... / Search videos..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="sticky top-[113px] z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
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
                {/* Freshness Hint */}
                {backendInfo?.windowStatus3d && (
                    <div className="mb-3 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <span>
                                Window {backendInfo.videosWindowDays || 3}d. New in window: <span className={`font-medium ${backendInfo.windowStatus3d.newInWindow > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>{backendInfo.windowStatus3d.newInWindow}</span>
                            </span>
                            {backendInfo.lastSuccessfulRunAt && (
                                <span className="text-gray-400 dark:text-gray-500">
                                    Last run: <span className="ltr-text">{new Date(backendInfo.lastSuccessfulRunAt).toLocaleTimeString()}</span>
                                </span>
                            )}
                        </div>
                    </div>
                )}

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
                    <div className="space-y-4">
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
