import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon && <div className="text-4xl mb-4 text-gray-400">{icon}</div>}
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
            {description && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6 rtl-text">{description}</p>}
            {action}
        </div>
    );
}
