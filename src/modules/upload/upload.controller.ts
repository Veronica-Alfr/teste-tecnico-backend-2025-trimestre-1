import { Controller, Post, UseInterceptors, UploadedFile, HttpCode, 
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {};

  @Post('video')
  @HttpCode(204)
  @UseInterceptors(
    FileInterceptor('video', {
      storage: memoryStorage(),
    })
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ 
            maxSize: 10 * 1024 * 1024, 
            message: 'File too large, max size is 10MB!' 
          }),
          new FileTypeValidator({ 
            fileType: /^video\/(mp4|quicktime|x-msvideo|webm|x-matroska|x-flv|x-ms-wmv)$/
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.uploadService.processFile(file);
  };
};
