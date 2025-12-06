import clsx from 'clsx';

interface ChipProps {
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    onRemove?: () => void;
    className?: string;
}

export function Chip({ label, isActive, onClick, onRemove, className }: ChipProps) {
    // Determine if label is Arabic (contains Arabic characters)
    const isArabic = /[\u0600-\u06FF]/.test(label);
    
    return (
        <div
            className={clsx(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer',
                isActive
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-500/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                isArabic && 'rtl-text',
                className
            )}
            onClick={onClick}
        >
            {label}
            {onRemove && (
                <button
                    type="button"
                    className="ml-1.5 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    ×
                </button>
            )}
        </div>
    );
}
