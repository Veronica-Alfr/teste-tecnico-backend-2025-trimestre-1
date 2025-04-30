export interface IVideoCache {
    getFromCache(filename: string): Promise<Buffer | null>;
    setToCache(filename: string, buffer: Buffer): Promise<void>;
};

export interface IUploadCache {
    cacheFile(key: string, buffer: Buffer): Promise<void>;
    deleteFromCache(key: string): Promise<void>;
};
