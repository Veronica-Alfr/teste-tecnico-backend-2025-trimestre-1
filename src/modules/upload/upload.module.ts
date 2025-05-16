import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { VideoCacheService } from '../../services/video-cache/video-cache.service';
import { FileWriterService } from '../../services/file-writer/file-writer.service';

@Module({
  controllers: [UploadController],
  providers: [
    {
      provide: 'IVideoCache',
      useClass: VideoCacheService,
    },
    {
      provide: 'IFileWriter',
      useClass: FileWriterService,
    },
    UploadService,
  ],
})
export class UploadModule {}
