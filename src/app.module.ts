import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UploadModule } from './modules/upload/upload.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'redis',
      port: 6379,
      ttl: 60,
    }),
    UploadModule,
  ],
})

export class AppModule {};
