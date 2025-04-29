import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { SharedCacheModule } from '../shared-cache/shared-cache.module';

@Module({
  imports: [SharedCacheModule],
  controllers: [UploadController],
  providers: [UploadService],
})

export class UploadModule {};
