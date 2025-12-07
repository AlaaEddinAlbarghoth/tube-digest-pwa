import { useEffect } from 'react';
import { useSettingsStore } from '@/state/settingsStore';
import { Card } from '@/components/shared/Card';
import { Toggle } from '@/components/shared/Toggle';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getBackendBaseUrl } from '@/config/runtimeConfig';
import type { ThemeMode } from '@/types/enums';

export function SettingsPage() {
    const {
        preferences,
        backendInfo,
        loading,
        loadSettings,
        updatePreferences,
        setTheme,
    } = useSettingsStore();

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
        { label: 'System', value: 'system', icon: '🖥️' },
        { label: 'Light', value: 'light', icon: '☀️' },
        { label: 'Dark', value: 'dark', icon: '🌙' },
    ];

    return (
        <div className="p-4 pb-20 max-w-2xl mx-auto space-y-6">
            {/* Preferences Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Preferences
                </h2>

                <Card className="divide-y divide-gray-200 dark:divide-gray-800">
                    <div className="p-4">
                        <Toggle
                            checked={preferences.sortHighPriorityFirst}
                            onChange={(checked) => updatePreferences({ sortHighPriorityFirst: checked })}
                            label="Sort high priority first"
                            description="Show high priority videos at the top of lists"
                        />
                    </div>

                    <div className="p-4">
                        <Toggle
                            checked={preferences.showOnlyLast7Days}
                            onChange={(checked) => updatePreferences({ showOnlyLast7Days: checked })}
                            label="Show only last 7 days"
                            description="Hide videos older than 7 days by default"
                        />
                    </div>
                </Card>
            </section>

            {/* Theme Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Appearance
                </h2>

                <Card className="p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Theme
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${preferences.theme === option.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <span className="text-2xl">{option.icon}</span>
                                <span className={`text-sm font-medium ${preferences.theme === option.value
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </Card>
            </section>

            {/* Freshness Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Freshness
                </h2>

                <Card className="p-4">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : backendInfo ? (
                        <div className="space-y-4">
                            {backendInfo.lastSuccessfulRunAt && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400">Last Successful Run</span>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm ltr-text">
                                        {new Date(backendInfo.lastSuccessfulRunAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {backendInfo.videosWindowDays && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400">Window Days</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{backendInfo.videosWindowDays}d</span>
                                </div>
                            )}
                            {backendInfo.windowStatus3d ? (
                                <>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Total in Window</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{backendInfo.windowStatus3d.totalInWindow ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Processed</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">{backendInfo.windowStatus3d.processedInWindow ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">New</span>
                                        <span className={`font-medium ${(backendInfo.windowStatus3d.newInWindow ?? 0) > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                                            {backendInfo.windowStatus3d.newInWindow ?? 0}
                                        </span>
                                    </div>
                                    {backendInfo.windowStatus3d.oldestNewTimestamp && (
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                            <span className="text-gray-500 dark:text-gray-400">Oldest NEW</span>
                                            <span className="font-medium text-gray-900 dark:text-white text-xs ltr-text">
                                                {new Date(backendInfo.windowStatus3d.oldestNewTimestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                                    بعض معلومات الخادم غير متاحة حالياً.
                                </div>
                            )}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-500 dark:text-gray-400">Max Summaries/Run</span>
                                <span className="font-medium text-gray-900 dark:text-white">{backendInfo.maxSummariesPerRun ?? 'N/A'}</span>
                            </div>
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                        await loadSettings();
                                        // Also refresh videos list if available
                                        if (window.location.pathname !== '/settings') {
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-full"
                                >
                                    Refresh Data
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-500 dark:text-gray-400 mb-3">Freshness data unavailable</p>
                            <Button variant="outline" size="sm" onClick={loadSettings}>
                                Retry
                            </Button>
                        </div>
                    )}
                </Card>
            </section>

            {/* Backend Info Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Backend Info
                </h2>

                <Card className="p-4">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : backendInfo ? (
                        <div className="space-y-4">
                            <div className="py-2">
                                <span className="text-gray-500 dark:text-gray-400 block mb-1">Backend Base URL</span>
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-700 dark:text-gray-300 break-all ltr-text">
                                    {getBackendBaseUrl()}
                                </code>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400">API Version</span>
                                <span className="font-medium text-gray-900 dark:text-white">{backendInfo.apiVersion || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400">Schedule</span>
                                <span className="font-medium text-gray-900 dark:text-white">{backendInfo.schedule || 'N/A'}</span>
                            </div>
                            {backendInfo.sheetId && (
                                <div className="py-2">
                                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Sheet ID</span>
                                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-700 dark:text-gray-300 break-all ltr-text">
                                        {backendInfo.sheetId}
                                    </code>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-500 dark:text-gray-400 mb-3">Backend info unavailable</p>
                            <div className="py-2 mb-3">
                                <span className="text-gray-500 dark:text-gray-400 block mb-1 text-xs">Backend Base URL (fallback)</span>
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-700 dark:text-gray-300 break-all ltr-text">
                                    {getBackendBaseUrl()}
                                </code>
                            </div>
                            <Button variant="outline" size="sm" onClick={loadSettings}>
                                Retry
                            </Button>
                        </div>
                    )}
                </Card>
            </section>

            {/* About Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    About
                </h2>

                <Card className="p-6">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
                            TD
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">TubeDigest</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Version 1.0.0</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-4 max-w-xs mx-auto">
                            AI-powered YouTube subscription summaries. Stay on top of your favorite channels without watching every video.
                        </p>

                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open('https://github.com/AlaaEddinAlbarghoth/yt-subscriptions-summarizer', '_blank')}
                            >
                                View on GitHub
                            </Button>

                            <div className="text-xs text-gray-400 dark:text-gray-600 font-mono space-y-1 ltr-text">
                                <p>Build: {typeof __GIT_SHA__ !== 'undefined' && __GIT_SHA__ !== 'dev' ? __GIT_SHA__.substring(0, 7) : (typeof __GIT_SHA__ !== 'undefined' ? __GIT_SHA__ : 'unknown')}</p>
                                <p>Date: {typeof __BUILD_TIME__ !== 'undefined' ? new Date(__BUILD_TIME__).toLocaleString() : 'local'}</p>
                            </div>

                            <Button
                                variant="danger"
                                size="xs"
                                onClick={async () => {
                                    if (confirm('Reset app cache and reload? This will clear offline data and cached preferences.')) {
                                        // Clear Service Workers
                                        if ('serviceWorker' in navigator) {
                                            const registrations = await navigator.serviceWorker.getRegistrations();
                                            for (const registration of registrations) {
                                                await registration.unregister();
                                            }
                                        }
                                        
                                        // Clear Workbox caches
                                        const keys = await caches.keys();
                                        await Promise.all(keys.map(key => caches.delete(key)));
                                        
                                        // Clear localStorage (preferences and any other cached data)
                                        localStorage.clear();
                                        
                                        // Clear IndexedDB if used (future-proofing)
                                        if ('indexedDB' in window) {
                                            try {
                                                const databases = await indexedDB.databases();
                                                await Promise.all(
                                                    databases.map(db => {
                                                        return new Promise<void>((resolve, reject) => {
                                                            const deleteReq = indexedDB.deleteDatabase(db.name || '');
                                                            deleteReq.onsuccess = () => resolve();
                                                            deleteReq.onerror = () => reject(deleteReq.error);
                                                            deleteReq.onblocked = () => resolve(); // Continue even if blocked
                                                        });
                                                    })
                                                );
                                            } catch (e) {
                                                console.warn('Error clearing IndexedDB:', e);
                                            }
                                        }
                                        
                                        window.location.reload();
                                    }
                                }}
                            >
                                Reset App Cache
                            </Button>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
}
