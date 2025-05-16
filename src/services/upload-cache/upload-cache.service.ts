// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { Cache } from 'cache-manager';
// import { IUploadCache } from 'src/interfaces/IVideoCache';

// @Injectable()
// export class UploadCacheService implements IUploadCache {
//   constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
//   private readonly logger = new Logger(UploadCacheService.name);

//   async cacheFile(key: string, buffer: Buffer): Promise<void> {
//     this.logger.debug(`Caching ${key} for 60s`);
//     await this.cacheManager.set(`video:${key}`, buffer, 60000);
//   }

//   async deleteFromCache(key: string): Promise<void> {
//     await this.cacheManager.del(`video:${key}`);
//   }
// }
