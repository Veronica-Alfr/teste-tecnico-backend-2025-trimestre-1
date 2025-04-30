import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { VideoCacheService } from 'src/services/video-cache/video-cache.service';
import { FileStorageService } from 'src/services/file-storage/file-storage.service';

@Module({
  providers: [
    {
      provide: 'IVideoCache',
      useClass: VideoCacheService,
    },
    {
      provide: 'IFileStorage',
      useClass: FileStorageService,
    },
    VideoService
  ],
  controllers: [VideoController],
})
export class VideoModule {}
