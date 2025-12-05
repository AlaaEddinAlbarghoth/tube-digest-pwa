import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

const getPageTitle = (pathname: string): string => {
    switch (pathname) {
        case '/':
            return 'Today\'s Digest';
        case '/videos':
            return 'All Videos';
        case '/channels':
            return 'Channels';
        case '/activity':
            return 'Activity Logs';
        case '/settings':
            return 'Settings';
        default:
            if (pathname.startsWith('/videos/')) return 'Video Details';
            return 'TubeDigest';
    }
};

export function AppLayout() {
    const location = useLocation();
    const title = getPageTitle(location.pathname);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <TopBar title={title} />

            <main className="flex-1 pb-20">
                <Outlet />
            </main>

            <BottomNav />
        </div>
    );
}
