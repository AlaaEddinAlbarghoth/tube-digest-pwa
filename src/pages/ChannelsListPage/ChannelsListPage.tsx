import { useEffect } from 'react';
import { useChannelsStore } from '@/state/channelsStore';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Toggle } from '@/components/shared/Toggle';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/shared/Button';

export function ChannelsListPage() {
    const {
        loading,
        error,
        onlyWithNew,
        search,
        fetchChannels,
        setSearch,
        toggleOnlyWithNew,
        getFilteredChannels,
    } = useChannelsStore();

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const channels = getFilteredChannels();

    return (
        <div className="flex flex-col h-full">
            {/* Search and Filters */}
            <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-950 p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
                <input
                    type="search"
                    placeholder="Search channels..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Toggle
                    checked={onlyWithNew}
                    onChange={toggleOnlyWithNew}
                    label="Only show channels with new videos"
                />
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading && channels.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <EmptyState
                        title="Error loading channels"
                        description={error}
                        action={<Button onClick={() => fetchChannels()}>Retry</Button>}
                    />
                ) : channels.length > 0 ? (
                    <div className="space-y-3 pb-4">
                        {channels.map((channel) => (
                            <Card key={channel.id} className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                                        {channel.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate rtl-text">
                                            {channel.name}
                                        </h3>

                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            <span>{channel.videoCount ?? 0} videos</span>
                                            {channel.newVideoCount && channel.newVideoCount > 0 && (
                                                <Badge variant="info">{channel.newVideoCount} new</Badge>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        {channel.tags && channel.tags.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {channel.tags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="📺"
                        title="No channels found"
                        description={search ? `No results for "${search}"` : "No channels available."}
                    />
                )}
            </div>
        </div>
    );
}
