import clsx from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
    return (
        <div
            className={clsx(
                'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden',
                onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
