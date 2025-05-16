export interface IVideoCache {
  cacheFile(filename: string, buffer: Buffer): Promise<void>;
  getFromCache(filename: string): Promise<Buffer | null>;
  deleteFromCache(filename: string): Promise<void>;
}
