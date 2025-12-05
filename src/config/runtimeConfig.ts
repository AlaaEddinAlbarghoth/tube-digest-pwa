/**
 * Runtime configuration helper
 * Reads from window.__TUBEDIGEST_CONFIG__ injected at runtime
 * Falls back to import.meta.env for local development
 * 
 * IMPORTANT: Config is read lazily (on first access) to ensure
 * window.__TUBEDIGEST_CONFIG__ is available after config.js loads.
 */

export interface RuntimeConfig {
    backendBaseUrl: string;
    appEnv: 'development' | 'staging' | 'production';
}

let cachedConfig: RuntimeConfig | null = null;

/**
 * Get runtime configuration lazily
 * This ensures config.js has loaded before we read window.__TUBEDIGEST_CONFIG__
 */
export const getRuntimeConfig = (): RuntimeConfig => {
    // Return cached value if already resolved
    if (cachedConfig) {
        return cachedConfig;
    }

    // 1. Try reading from runtime injected config (Docker/Production)
    // Only use if backendBaseUrl is actually set (prevents empty config.js from overriding env vars)
    if (typeof window !== 'undefined' &&
        window.__TUBEDIGEST_CONFIG__ &&
        window.__TUBEDIGEST_CONFIG__.backendBaseUrl &&
        window.__TUBEDIGEST_CONFIG__.backendBaseUrl.length > 0) {
        cachedConfig = {
            backendBaseUrl: window.__TUBEDIGEST_CONFIG__.backendBaseUrl,
            appEnv: window.__TUBEDIGEST_CONFIG__.appEnv,
        };
        return cachedConfig;
    }

    // 2. Fallback to Vite env vars (Local Dev)
    cachedConfig = {
        backendBaseUrl: import.meta.env.VITE_BACKEND_URL || '',
        appEnv: (import.meta.env.MODE as 'development' | 'staging' | 'production') || 'development',
    };

    console.log('[RuntimeConfig] Loaded config:', {
        source: window.__TUBEDIGEST_CONFIG__ ? 'window' : 'env',
        backendBaseUrl: cachedConfig.backendBaseUrl,
        env: cachedConfig.appEnv
    });

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
 * Get app environment
 */
export const getAppEnv = (): RuntimeConfig['appEnv'] => {
    return getRuntimeConfig().appEnv;
};
