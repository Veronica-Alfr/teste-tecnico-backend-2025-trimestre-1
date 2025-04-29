import { Module } from '@nestjs/common';
import { UploadModule } from './modules/upload/upload.module';
import { VideoModule } from './modules/video/video.module';
import { SharedCacheModule } from './modules/shared-cache/shared-cache.module';

@Module({
  imports: [UploadModule, VideoModule, SharedCacheModule],
})

export class AppModule {};
