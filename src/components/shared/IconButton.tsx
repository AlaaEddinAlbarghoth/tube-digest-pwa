import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: string;
}

export function IconButton({ icon, className, ...props }: IconButtonProps) {
    return (
        <button
            className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'text-gray-600 dark:text-gray-400',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'transition-colors duration-200',
                className
            )}
            {...props}
        >
            <span className="text-xl">{icon}</span>
        </button>
    );
}
