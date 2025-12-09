import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [installedHint, setInstalledHint] = useState(false);

    const isStandalone = (() => {
        if (typeof window === 'undefined') return false;
        const mq = window.matchMedia('(display-mode: standalone)');
        // @ts-ignore navigator.standalone exists on iOS Safari
        return mq.matches || (typeof navigator !== 'undefined' && (navigator as any).standalone);
    })();

    useEffect(() => {
        if (isStandalone) {
            setDeferredPrompt(null);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, [isStandalone]);

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return { accepted: false };
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            setInstalledHint(true);
            setDeferredPrompt(null);
        }
        return { accepted: choice.outcome === 'accepted' };
    }, [deferredPrompt]);

    const canInstall = !!deferredPrompt && !isStandalone;

    return { canInstall, promptInstall, isStandalone, installedHint, setInstalledHint };
}

