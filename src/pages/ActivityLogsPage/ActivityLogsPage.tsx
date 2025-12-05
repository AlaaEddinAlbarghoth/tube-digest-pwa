import { useEffect } from 'react';
import { useLogsStore } from '@/state/logsStore';
import { RunLogItem } from '@/components/features/RunLogItem';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDistanceToNow } from 'date-fns';

export function ActivityLogsPage() {
    const {
        lastRunSummary,
        logs,
        loading,
        error,
        hasMore,
        fetchLogs,
        fetchNextPage,
    } = useLogsStore();

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    if (loading && logs.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <EmptyState
                    title="Error loading activity"
                    description={error}
                    action={<Button onClick={() => fetchLogs()}>Retry</Button>}
                />
            </div>
        );
    }

    return (
        <div className="p-4 pb-20">
            {/* Last Run Summary Card */}
            {lastRunSummary && (
                <Card className="mb-6 overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">
                                Last Run
                            </h2>
                            <Badge
                                variant={lastRunSummary.status === 'success' ? 'success' : lastRunSummary.status === 'error' ? 'error' : 'warning'}
                                className="bg-white/20 text-white border-none"
                            >
                                {lastRunSummary.status === 'success' ? '✓ Success' : lastRunSummary.status === 'error' ? '✗ Failed' : '⏳ Running'}
                            </Badge>
                        </div>
                        <p className="text-2xl font-bold">
                            {formatDistanceToNow(new Date(lastRunSummary.startedAt), { addSuffix: true })}
                        </p>
                    </div>

                    <div className="p-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {lastRunSummary.subscriptionsChecked ?? '-'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscriptions</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {lastRunSummary.channelsWithNewVideos ?? '-'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channels</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {lastRunSummary.videosProcessed}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Videos</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Run History */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Run History
                </h2>
                <Button variant="ghost" size="sm" onClick={() => fetchLogs()}>
                    Refresh
                </Button>
            </div>

            {logs.length > 0 ? (
                <div className="space-y-4">
                    {logs.map((log) => (
                        <RunLogItem key={log.id} log={log} />
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
                    icon="📊"
                    title="No activity logs"
                    description="Activity logs will appear here after the first run."
                />
            )}
        </div>
    );
}
