import { BadRequestException, Controller, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Express, Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('video')
  @UseInterceptors(FileInterceptor('video', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new BadRequestException('Only video files are allowed!'), false);
      }
      cb(null, true);
    }
  }))

  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    await this.uploadService.processFile(file);
    return res.status(204).send();
  }
};
