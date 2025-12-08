import { useState } from 'react';
import { Chip } from './Chip';
import { Button } from './Button';
import type { Priority, VideoStatus } from '@/types/enums';

interface FiltersPanelProps {
    statuses: { label: string; value: VideoStatus | null }[];
    priorities: { label: string; value: Priority | null }[];
    categories: { label: string; value: string | null }[];
    activeStatus: VideoStatus | null;
    activePriority: Priority | null;
    activeCategory: string | null;
    onStatusChange: (status: VideoStatus | null) => void;
    onPriorityChange: (priority: Priority | null) => void;
    onCategoryChange: (category: string | null) => void;
    onReset: () => void;
}

export function FiltersPanel({
    statuses,
    priorities,
    categories,
    activeStatus,
    activePriority,
    activeCategory,
    onStatusChange,
    onPriorityChange,
    onCategoryChange,
    onReset,
}: FiltersPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveFilters = activeStatus !== null || activePriority !== null || activeCategory !== null;

    return (
        <div className="border-b border-gray-200 dark:border-gray-800">
            {/* Status filters - always visible */}
            <div className="px-4 py-2">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Status:</span>
                    {statuses.map((s) => (
                        <Chip
                            key={s.value ?? 'all'}
                            label={s.label}
                            isActive={activeStatus === s.value}
                            onClick={() => onStatusChange(s.value)}
                        />
                    ))}
                </div>
            </div>

            {/* Collapsible section */}
            <div className="border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <span>More Filters</span>
                        {hasActiveFilters && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                                {[activePriority, activeCategory].filter(Boolean).length}
                            </span>
                        )}
                    </span>
                    <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                {isOpen && (
                    <div className="px-4 pb-3 space-y-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        {/* Priority filters */}
                        {priorities.length > 1 && (
                            <div>
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Priority:</span>
                                    {priorities.map((p) => (
                                        <Chip
                                            key={p.value ?? 'all'}
                                            label={p.label}
                                            isActive={activePriority === p.value}
                                            onClick={() => onPriorityChange(p.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Category filters */}
                        {categories.length > 1 && (
                            <div>
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Category:</span>
                                    {categories.map((c) => (
                                        <Chip
                                            key={c.value ?? 'all'}
                                            label={c.label}
                                            isActive={activeCategory === c.value}
                                            onClick={() => onCategoryChange(c.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reset button */}
                        {hasActiveFilters && (
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onReset}
                                    className="w-full"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

