import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IVideoCache } from '../../interfaces/IVideoCache';
import { Readable } from 'stream';
import { createWriteStream, createReadStream } from 'fs';
import { join } from 'path';
import { mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { pipeline } from 'stream/promises';

@Injectable()
export class VideoCacheService implements IVideoCache, OnModuleInit {
  private readonly logger = new Logger(VideoCacheService.name);
  private readonly VIDEO_TTL = 60;
  private readonly CACHE_DIR: string;
  private readonly CHUNK_SIZE = 1024 * 1024;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.CACHE_DIR = join(process.cwd(), 'cache');
  }

  async onModuleInit() {
    await this.initializeCacheDir();
  }

  private async initializeCacheDir() {
    if (!existsSync(this.CACHE_DIR)) {
      await mkdir(this.CACHE_DIR, { recursive: true });
    }
  }

  private getCacheFilePath(filename: string): string {
    return join(this.CACHE_DIR, filename);
  }

  async cacheFile(filename: string, stream: Readable): Promise<void> {
    this.logger.debug(`Caching file for upload: ${filename}`);

    try {
      const cachePath = this.getCacheFilePath(filename);
      const writeStream = createWriteStream(cachePath, {
        highWaterMark: this.CHUNK_SIZE,
      });

      await pipeline(stream, writeStream);

      await this.cacheManager.set(filename, cachePath, this.VIDEO_TTL);
    } catch (error: unknown) {
      this.logger.error(
        `Error caching file ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async getFromCache(filename: string): Promise<Readable | null> {
    this.logger.debug(`Getting file from cache: ${filename}`);
    const cachePath = await this.cacheManager.get<string>(filename);

    if (cachePath) {
      await this.cacheManager.set(filename, cachePath, this.VIDEO_TTL);
      return createReadStream(cachePath, {
        highWaterMark: this.CHUNK_SIZE,
      });
    }

    return null;
  }

  async deleteFromCache(filename: string): Promise<void> {
    this.logger.debug(`Removing file from cache: ${filename}`);
    const cachePath = await this.cacheManager.get<string>(filename);

    if (cachePath) {
      await unlink(cachePath).catch(() => {
        this.logger.warn(`Failed to delete cache file: ${cachePath}`);
      });
    }

    await this.cacheManager.del(filename);
  }
}
