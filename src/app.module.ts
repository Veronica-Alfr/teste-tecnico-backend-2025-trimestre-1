import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { UploadModule } from './modules/upload/upload.module';
import { VideoModule } from './modules/video/video.module';
import { VideoCacheService } from './services/video-cache/video-cache.service';
import { FileStorageService } from './services/file-storage/file-storage.service';
import { FileUtils } from './utils/file';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        ttl: 60,
      }),
    }),
    UploadModule,
    VideoModule,
  ],
  providers: [VideoCacheService, FileStorageService],
})
export class AppModule implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    FileUtils.initialize(this.configService);
  }
}
