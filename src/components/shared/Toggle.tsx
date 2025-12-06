import clsx from 'clsx';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
    return (
        <div className={clsx('flex items-center justify-between', disabled && 'opacity-50 cursor-not-allowed')}>
            {(label || description) && (
                <div className="flex flex-col mr-4" onClick={() => !disabled && onChange(!checked)}>
                    {label && (
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 rtl-text">
                            {description}
                        </span>
                    )}
                </div>
            )}

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={clsx(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
            >
                <span
                    aria-hidden="true"
                    className={clsx(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        checked ? 'translate-x-5' : 'translate-x-0'
                    )}
                />
            </button>
        </div>
    );
}
