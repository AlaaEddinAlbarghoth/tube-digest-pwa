import { create } from 'zustand';
import { ChannelsApi } from '@/api/channelsApi';
import { ApiError } from '@/api/client';
import type { Channel } from '@/types/channel';

/**
 * Channels store state interface
 */
interface ChannelsState {
    // State
    channels: Record<string, Channel>;
    channelIds: string[];
    loading: boolean;
    error: string | null;
    onlyWithNew: boolean;
    search: string;

    // Actions
    fetchChannels: () => Promise<void>;
    setSearch: (query: string) => void;
    toggleOnlyWithNew: () => void;
    clearError: () => void;

    // Computed
    getFilteredChannels: () => Channel[];
}

/**
 * Channels Store
 * 
 * Manages channel list with search and filtering
 */
export const useChannelsStore = create<ChannelsState>((set, get) => ({
    // Initial state
    channels: {},
    channelIds: [],
    loading: false,
    error: null,
    onlyWithNew: false,
    search: '',

    /**
     * Fetch channels from API
     */
    fetchChannels: async () => {
        const { onlyWithNew } = get();

        set({ loading: true, error: null });

        try {
            const channels = await ChannelsApi.getChannels({
                onlyWithNew,
            });

            // Convert to map
            const channelsMap: Record<string, Channel> = {};
            const channelIds: string[] = [];

            channels.forEach((channel) => {
                channelsMap[channel.id] = channel;
                channelIds.push(channel.id);
            });

            set({
                channels: channelsMap,
                channelIds,
                loading: false,
            });
        } catch (error) {
            const message = error instanceof ApiError ? error.getUserMessage() : (error as Error).message;
            set({
                error: message,
                loading: false,
            });
        }
    },

    /**
     * Update search query
     * Search is performed client-side using getFilteredChannels()
     */
    setSearch: (query: string) => {
        set({ search: query });
    },

    /**
     * Toggle "only show channels with new videos" filter
     */
    toggleOnlyWithNew: () => {
        set((state) => ({ onlyWithNew: !state.onlyWithNew }));

        // Refetch with new filter
        get().fetchChannels();
    },

    /**
     * Clear error state
     */
    clearError: () => {
        set({ error: null });
    },

    /**
     * Get filtered channels based on search query
     * This is a computed getter that filters client-side
     */
    getFilteredChannels: () => {
        const { channels, channelIds, search } = get();

        let filtered = channelIds.map((id) => channels[id]);

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (channel) =>
                    channel.name.toLowerCase().includes(searchLower) ||
                    channel.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
            );
        }

        return filtered;
    },
}));
