export function VideoCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm animate-pulse">
            <div className="p-4 pb-3 flex items-start gap-3">
                {/* Channel Avatar Skeleton */}
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

                <div className="flex-1 min-w-0 space-y-2">
                    {/* Channel name and time skeleton */}
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    {/* Title skeleton */}
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
            </div>

            {/* Badges skeleton */}
            <div className="px-4 flex gap-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12" />
            </div>

            {/* Excerpt skeleton */}
            <div className="px-4 pt-3 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>

            {/* Action buttons skeleton */}
            <div className="p-4 pt-3 flex gap-2">
                <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );
}

