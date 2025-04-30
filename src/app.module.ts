import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { UploadModule } from './modules/upload/upload.module';
import { VideoModule } from './modules/video/video.module';
import { VideoCacheService } from './services/video-cache/video-cache.service';
import { FileStorageService } from './services/file-storage/file-storage.service';
import { FileWriterService } from './services/file-writer/file-writer.service';
import { UploadCacheService } from './services/upload-cache/upload-cache.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.get<string>('REDIS_HOST', 'redis'),
            port: config.get<number>('REDIS_PORT', 6379),
          },
          ttl: config.get<number>('CACHE_TTL', 60),
        }),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    UploadModule,
    VideoModule
  ],
  providers: [VideoCacheService, FileStorageService, FileWriterService, UploadCacheService],
})

export class AppModule {};
