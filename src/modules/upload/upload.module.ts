import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadCacheService } from 'src/services/upload-cache/upload-cache.service';
import { FileWriterService } from 'src/services/file-writer/file-writer.service';

@Module({
  controllers: [UploadController],
  providers: [
    {
      provide: 'IUploadCache',
      useClass: UploadCacheService,
    },
    {
      provide: 'IFileWriter',
      useClass: FileWriterService,
    },
    UploadService,
  ],
})

export class UploadModule {};
