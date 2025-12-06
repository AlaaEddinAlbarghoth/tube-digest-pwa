/**
 * Runtime configuration helper
 * Reads from window.__TUBEDIGEST_CONFIG__ injected at runtime
 * Falls back to import.meta.env for local development
 * 
 * IMPORTANT: Config is read lazily (on first access) to ensure
 * window.__TUBEDIGEST_CONFIG__ is available after config.js loads.
 * 
 * CRITICAL: Never allows empty backendBaseUrl. Falls back to hardcoded default if needed.
 */

export interface RuntimeConfig {
    backendBaseUrl: string;
    apiToken?: string;
    appEnv: 'development' | 'staging' | 'production';
}

// Hardcoded fallback backend URL (production Apps Script deployment)
// This ensures the app never fails due to missing configuration
const FALLBACK_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbxIcyOCoF1ELz2yRKFFpSH8Y_Uu38KaJoDXpjeYXkM7_ue-0mhL9UqQ5-ZdXz3ldPyk/exec';

let cachedConfig: RuntimeConfig | null = null;

/**
 * Get runtime configuration lazily
 * This ensures config.js has loaded before we read window.__TUBEDIGEST_CONFIG__
 * 
 * Resolution order:
 * 1. window.__TUBEDIGEST_CONFIG__.backendBaseUrl (if non-empty)
 * 2. import.meta.env.VITE_BACKEND_URL (if set)
 * 3. FALLBACK_BACKEND_URL (hardcoded production URL)
 * 
 * Never returns empty string for backendBaseUrl.
 */
export const getRuntimeConfig = (): RuntimeConfig => {
    // Return cached value if already resolved
    if (cachedConfig) {
        return cachedConfig;
    }

    let resolvedUrl = '';
    let source = '';

    // 1. Try reading from runtime injected config (Docker/Production)
    if (typeof window !== 'undefined' &&
        window.__TUBEDIGEST_CONFIG__ &&
        window.__TUBEDIGEST_CONFIG__.backendBaseUrl &&
        window.__TUBEDIGEST_CONFIG__.backendBaseUrl.length > 0) {
        resolvedUrl = window.__TUBEDIGEST_CONFIG__.backendBaseUrl;
        source = 'window.__TUBEDIGEST_CONFIG__';
    }
    // 2. Fallback to Vite env vars (Local Dev / Vercel)
    else if (import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_BACKEND_URL.length > 0) {
        resolvedUrl = import.meta.env.VITE_BACKEND_URL;
        source = 'VITE_BACKEND_URL';
    }
    // 3. Fallback to hardcoded production URL (safety net)
    else {
        resolvedUrl = FALLBACK_BACKEND_URL;
        source = 'FALLBACK_BACKEND_URL';
        
        // Warn in development mode only
        if (import.meta.env.DEV) {
            console.warn('[RuntimeConfig] Using fallback backend URL. Set VITE_BACKEND_URL or configure config.js');
        }
    }

    cachedConfig = {
        backendBaseUrl: resolvedUrl,
        apiToken: window.__TUBEDIGEST_CONFIG__?.apiToken || import.meta.env.VITE_API_TOKEN,
        appEnv: (window.__TUBEDIGEST_CONFIG__?.appEnv || import.meta.env.MODE || 'development') as 'development' | 'staging' | 'production',
    };

    console.log('[RuntimeConfig] Loaded config:', {
        source: source,
        backendBaseUrl: cachedConfig.backendBaseUrl.substring(0, 50) + '...',
        env: cachedConfig.appEnv
    });

    // Runtime assert: backendBaseUrl must never be empty
    if (!cachedConfig.backendBaseUrl || cachedConfig.backendBaseUrl.length === 0) {
        const error = new Error('CRITICAL: backendBaseUrl is empty after resolution. This should never happen.');
        console.error('[RuntimeConfig]', error);
        throw error;
    }

    return cachedConfig;
};

/**
 * Get backend base URL
 * Use this function instead of accessing runtimeConfig directly
 */
export const getBackendBaseUrl = (): string => {
    return getRuntimeConfig().backendBaseUrl;
};

/**
 * Get API token
 */
export const getApiToken = (): string | undefined => {
    return getRuntimeConfig().apiToken;
};

/**
 * Get app environment
 */
export const getAppEnv = (): RuntimeConfig['appEnv'] => {
    return getRuntimeConfig().appEnv;
};
