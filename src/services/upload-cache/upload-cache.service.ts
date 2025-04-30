import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IUploadCache } from 'src/interfaces/IVideoCache';

@Injectable()
export class UploadCacheService implements IUploadCache {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async cacheFile(key: string, buffer: Buffer): Promise<void> {
    await this.cacheManager.set(`video:${key}`, buffer, 60000);
  }

  async deleteFromCache(key: string): Promise<void> {
    await this.cacheManager.del(`video:${key}`);
  }
}