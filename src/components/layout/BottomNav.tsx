import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

interface NavItem {
    to: string;
    icon: string;
    label: string;
}

const navItems: NavItem[] = [
    { to: '/', icon: '📅', label: 'Today' },
    { to: '/videos', icon: '🎬', label: 'Videos' },
    { to: '/channels', icon: '📺', label: 'Channels' },
    { to: '/activity', icon: '📊', label: 'Activity' },
    { to: '/settings', icon: '⚙️', label: 'More' },
];

export function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            clsx(
                                'flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-0 flex-1 h-full',
                                'transition-colors duration-200',
                                isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            )
                        }
                    >
                        <span className="text-xl leading-none">{item.icon}</span>
                        <span className="text-[10px] font-medium leading-none">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
