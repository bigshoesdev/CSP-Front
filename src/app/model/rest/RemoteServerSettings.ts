export interface RemoteServerSettings {
    updateTime: number;
    urls: {
        clients: string;
        therapists: string;
        services: string;
        events: string;
    };
}
