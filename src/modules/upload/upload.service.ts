import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class UploadService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    console.log('CACHE_MANAGER:', cacheManager.constructor.name);
  }

  async processFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('You need to upload a video file!');
    }

    const cacheKey = file.originalname;
    console.log(`Saving file to cache: ${cacheKey}`);

    const base64String = file.buffer.toString('base64');
    const testcache = await this.cacheManager.set(cacheKey, base64String, 180);
    console.log(`Cache set: ${testcache}`);

    const cacheTest = await this.cacheManager.get(cacheKey);
    console.log(`Cache test retrieval:`, cacheTest ? 'Success' : 'Failed');

    const videosFolderPath = join(process.cwd(), 'videos');
    const uploadPath = join(videosFolderPath, file.originalname);

    if (!existsSync(videosFolderPath)) {
      await mkdir(videosFolderPath, { recursive: true });
    }

    await writeFile(uploadPath, file.buffer);
  }
}
