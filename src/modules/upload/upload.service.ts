import { Injectable, Inject, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { fileTypeFromBuffer } from 'file-type';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async processFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BadRequestException('You need to upload a video file!');
    }

    const type = await fileTypeFromBuffer(file.buffer);
  
    if (!type?.mime.startsWith('video/')) {
      throw new BadRequestException('Only video files are allowed!');
    }

    const fileId = uuidv4();
    const cacheKey = `video:${fileId}`;
    const fileName = `${fileId}${extname(file.originalname)}`;
    const videosFolderPath = join(process.cwd(), 'videos');
    const uploadPath = join(videosFolderPath, fileName);

    try {
      this.logger.debug(`Processing file: ${fileName}`);

      await this.cacheManager.set(cacheKey, file.buffer, 60000);
      this.logger.debug(`Cached: ${cacheKey}`);

      if (!existsSync(videosFolderPath)) {
        await mkdir(videosFolderPath, { recursive: true });
      }

      await writeFile(uploadPath, file.buffer);
      this.logger.log(`File stored: ${fileName}`);
    } catch (error) {
      this.logger.error(`Processing failed: ${error.message}`);
      await this.cacheManager.del(cacheKey);
      throw new InternalServerErrorException('File processing failed');
    }
  };
};
