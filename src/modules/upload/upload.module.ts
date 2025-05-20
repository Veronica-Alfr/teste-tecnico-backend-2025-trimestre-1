import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { VideoCacheService } from '../../services/video-cache/video-cache.service';

@Module({
  controllers: [UploadController],
  providers: [
    {
      provide: 'IVideoCache',
      useClass: VideoCacheService,
    },
    UploadService,
  ],
})
export class UploadModule {}
