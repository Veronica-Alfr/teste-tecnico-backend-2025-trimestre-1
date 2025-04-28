import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [CacheModule.register()], 
  controllers: [UploadController],
  providers: [UploadService],
})

export class UploadModule {};
