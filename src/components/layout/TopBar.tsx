import { useNavigate } from 'react-router-dom';
import { IconButton } from '@/components/shared/IconButton';

interface TopBarProps {
    title: string;
}

export function TopBar({ title }: TopBarProps) {
    const navigate = useNavigate();

    // Get build marker (short SHA or version)
    // Prefer __BUILD_SHA__ (injected at build time), fallback to __GIT_SHA__
    const buildSha = typeof __BUILD_SHA__ !== 'undefined' && __BUILD_SHA__ !== 'dev'
        ? __BUILD_SHA__
        : typeof __GIT_SHA__ !== 'undefined' && __GIT_SHA__ !== 'dev'
            ? __GIT_SHA__
            : 'unknown';
    const buildMarker = buildSha !== 'unknown' && buildSha.length >= 7
        ? buildSha.substring(0, 7)
        : buildSha;

    return (
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-4 h-14">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        TD
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono ltr-text">
                        Build: {buildMarker}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <IconButton
                        icon="⚙️"
                        onClick={() => navigate('/settings')}
                        aria-label="Settings"
                    />
                </div>
            </div>
        </header>
    );
}
