import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UploadModule } from './modules/upload/upload.module';
import { VideoController } from './modules/video/video.controller';
import { VideoService } from './modules/video/video.service';
import { VideoModule } from './modules/video/video.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'redis',
      port: 6379,
      ttl: 180,
    }),
    UploadModule,
    VideoModule,
  ],
  controllers: [VideoController],
  providers: [VideoService],
})

export class AppModule {};
