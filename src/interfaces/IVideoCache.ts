import { Readable } from 'stream';

export interface IVideoCache {
  cacheFile(filename: string, stream: Readable): Promise<void>;
  getFromCache(filename: string): Promise<Readable | null>;
  deleteFromCache(filename: string): Promise<void>;
}
