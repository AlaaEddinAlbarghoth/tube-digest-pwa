export { };

declare global {
    interface Window {
        __TUBEDIGEST_CONFIG__?: {
            backendBaseUrl: string;
            apiToken?: string;
            appEnv: 'development' | 'staging' | 'production';
        };
    }
}
