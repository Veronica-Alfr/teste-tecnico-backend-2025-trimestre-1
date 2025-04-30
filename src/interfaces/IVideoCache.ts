export interface IVideoCache {
    getFromCache(filename: string): Promise<Buffer | null>;
};

export interface IUploadCache {
    cacheFile(key: string, buffer: Buffer): Promise<void>;
    deleteFromCache(key: string): Promise<void>;
};
