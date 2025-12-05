import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TodayDigestPage } from '@/pages/TodayDigestPage/TodayDigestPage';
import { VideosListPage } from '@/pages/VideosListPage/VideosListPage';
import { VideoDetailsPage } from '@/pages/VideoDetailsPage/VideoDetailsPage';
import { ChannelsListPage } from '@/pages/ChannelsListPage/ChannelsListPage';
import { ActivityLogsPage } from '@/pages/ActivityLogsPage/ActivityLogsPage';
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <TodayDigestPage />,
            },
            {
                path: 'videos',
                element: <VideosListPage />,
            },
            {
                path: 'videos/:id',
                element: <VideoDetailsPage />,
            },
            {
                path: 'channels',
                element: <ChannelsListPage />,
            },
            {
                path: 'activity',
                element: <ActivityLogsPage />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
            {
                path: '*',
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);
