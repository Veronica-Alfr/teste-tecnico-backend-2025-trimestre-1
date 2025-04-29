import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { SharedCacheModule } from '../shared-cache/shared-cache.module';

@Module({
  imports: [SharedCacheModule],
  providers: [VideoService],
  controllers: [VideoController],
})
export class VideoModule {}
