import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IVideoCache } from '../../interfaces/IVideoCache';

@Injectable()
export class VideoCacheService implements IVideoCache {
  private readonly logger = new Logger(VideoCacheService.name);
  private readonly VIDEO_TTL = 60;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async cacheFile(filename: string, buffer: Buffer): Promise<void> {
    this.logger.debug(`Caching file for upload: ${filename}`);
    await this.cacheManager.set(filename, buffer, this.VIDEO_TTL);
  }

  async getFromCache(filename: string): Promise<Buffer | null> {
    this.logger.debug(`Getting file from cache: ${filename}`);
    const cachedFile = await this.cacheManager.get<Buffer>(filename);

    if (cachedFile) {
      await this.cacheManager.set(filename, cachedFile, this.VIDEO_TTL);
    }

    return cachedFile || null;
  }

  async deleteFromCache(filename: string): Promise<void> {
    this.logger.debug(`Removing file from cache: ${filename}`);
    await this.cacheManager.del(filename);
  }
}
