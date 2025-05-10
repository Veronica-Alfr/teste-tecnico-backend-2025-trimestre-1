import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IVideoCache } from 'src/interfaces/IVideoCache';

@Injectable()
export class VideoCacheService implements IVideoCache {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getFromCache(filename: string): Promise<Buffer | null> {
    return this.cacheManager.get<Buffer>(`video:${filename}`);
  }
}
