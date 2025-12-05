import { API_CONFIG } from '@/config/constants';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string,
        public data?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }

    /**
     * Check if this is a network error
     */
    isNetworkError(): boolean {
        return this.code === 'NETWORK_ERROR';
    }

    /**
     * Check if this is a rate limit error
     */
    isRateLimitError(): boolean {
        return this.status === 429 || this.code === 'RATE_LIMIT';
    }

    /**
     * Get a user-friendly error message
     */
    getUserMessage(): string {
        if (this.isNetworkError()) {
            return 'Unable to connect to server. Please check your internet connection.';
        }
        if (this.isRateLimitError()) {
            return 'Too many requests. Please wait a moment and try again.';
        }
        if (this.status === 500) {
            return 'Server error. The backend may be temporarily unavailable.';
        }
        return this.message || 'An unexpected error occurred. Please try again.';
    }
}

/**
 * Handle HTTP response and parse JSON
 * Apps Script returns 200 for successful requests
 * but may have an `error` field in the JSON for application errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
    // Handle network-level HTTP errors
    if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        try {
            errorData = await response.json();
        } catch {
            // Response body is not JSON
        }

        throw new ApiError(
            errorData.message as string || errorData.error as string || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.code as string,
            errorData
        );
    }

    let data: Record<string, unknown>;
    try {
        data = await response.json();
    } catch {
        throw new ApiError('Invalid JSON response from server', response.status, 'PARSE_ERROR');
    }

    // Check for Apps Script application-level errors
    // Apps Script typically returns { error: "message" } or { success: false, error: "message" }
    if (data.error) {
        throw new ApiError(
            data.error as string,
            response.status,
            data.code as string,
            data
        );
    }

    // Handle explicit success: false
    if (data.success === false) {
        throw new ApiError(
            data.message as string || 'Request failed',
            response.status,
            data.code as string,
            data
        );
    }

    return data as T;
}

/**
 * Build URL with query parameters for Apps Script
 * Uses `?action=actionName` pattern
 */
function buildUrl(action: string, params?: Record<string, string | number | boolean | undefined>): string {
    const baseUrl = API_CONFIG.baseUrl;

    if (!baseUrl) {
        throw new ApiError('Backend URL not configured. Set VITE_BACKEND_URL in your environment.', undefined, 'CONFIG_ERROR');
    }

    const url = new URL(baseUrl);
    url.searchParams.set('action', action);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            // Only add params that have a value
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.toString();
}

/**
 * HTTP GET request
 */
export async function get<T>(
    action: string,
    params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
    const url = buildUrl(action, params);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        return handleResponse<T>(response);
    } catch (error) {
        // Re-throw ApiError as-is
        if (error instanceof ApiError) {
            throw error;
        }
        // Wrap network errors
        throw new ApiError(
            'Network error. Please check your connection.',
            undefined,
            'NETWORK_ERROR',
            { originalError: error }
        );
    }
}

/**
 * HTTP POST request
 * For Apps Script, POST data can be sent as JSON body
 */
export async function post<T>(
    action: string,
    body?: unknown
): Promise<T> {
    const url = buildUrl(action);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
            cache: 'no-store',
        });

        return handleResponse<T>(response);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            'Network error. Please check your connection.',
            undefined,
            'NETWORK_ERROR',
            { originalError: error }
        );
    }
}
