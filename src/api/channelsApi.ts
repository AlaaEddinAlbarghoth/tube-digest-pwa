import { get } from './client';
import type { Channel } from '@/types/channel';

/**
 * Query parameters for listing channels
 */
export interface ChannelsQuery {
    onlyWithNew?: boolean;
}

/**
 * Response from listChannels API
 */
interface ListChannelsResponse {
    channels: Channel[];
}

/**
 * Channels API client
 */
export const ChannelsApi = {
    /**
     * Fetch list of channels with optional filters
     * 
     * @param params - Query parameters for filtering channels
     * @returns Array of channels
     */
    async getChannels(params?: ChannelsQuery): Promise<Channel[]> {
        const response = await get<ListChannelsResponse>(
            'listChannels',
            params as unknown as Record<string, boolean>
        );
        return response.channels;
    },
};
