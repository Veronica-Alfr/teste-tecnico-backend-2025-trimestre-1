import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UploadService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {};

  async processFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('You need to upload a video file!');
    }

    const cacheKey = `uploaded_video_${Date.now()}`;
    await this.cacheManager.set(cacheKey, file.originalname);
  };
};
