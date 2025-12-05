export { };

declare global {
    interface Window {
        __TUBEDIGEST_CONFIG__?: {
            backendBaseUrl: string;
            appEnv: 'development' | 'staging' | 'production';
        };
    }
}
