import { format } from 'date-fns';
import type { RunLog } from '@/types/run';
import { Badge } from '@/components/shared/Badge';
import { formatRunDuration } from '@/utils/formatters';

interface RunLogItemProps {
    log: RunLog;
}

export function RunLogItem({ log }: RunLogItemProps) {
    const statusVariant = log.status === 'success' ? 'success' : log.status === 'error' ? 'error' : 'warning';



    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start justify-between mb-3">
                {/* Date and Time */}
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        <span className="ltr-text">{format(new Date(log.startedAt), 'MMM d, yyyy')}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="ltr-text">{format(new Date(log.startedAt), 'h:mm a')}</span>
                    </p>
                </div>

                {/* Status Badge */}
                <Badge variant={statusVariant}>
                    {log.status === 'success' ? '✓ Success' : log.status === 'error' ? '✗ Failed' : '⏳ Running'}
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {log.subscriptionsChecked ?? '-'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Subs</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {log.channelsWithNewVideos ?? '-'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Channels</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {log.videosProcessed}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Videos</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatRunDuration(log.duration)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                </div>
            </div>

            {/* Error message if failed */}
            {log.error && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {log.error}
                    </p>
                </div>
            )}
        </div>
    );
}
