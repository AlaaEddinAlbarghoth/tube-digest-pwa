export interface Channel {
    id: string;
    youtubeChannelId: string;
    name: string;
    avatarUrl?: string;
    tags?: string[];
    videoCount?: number;
    newVideoCount?: number;
    stats?: {
        videosLast7Days: number;
        newVideosLastRun: number;
    };
}
