import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { UploadModule } from './modules/upload/upload.module';
import { VideoModule } from './modules/video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: () => redisStore({
          socket: {
            host: config.get('REDIS_HOST', 'localhost'),
            port: config.get('REDIS_PORT', 6379),
          },
          ttl: config.get('CACHE_TTL', 60),
        }),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    UploadModule,
    VideoModule
  ],
})

export class AppModule {};
