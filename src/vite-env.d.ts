/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    readonly VITE_API_TOKEN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare const __BUILD_SHA__: string;
declare const __GIT_SHA__: string; // Keep for backward compatibility
declare const __BUILD_TIME__: string;
