import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { InvalidFileTypeError } from 'src/custom/error/errors';
import { IFileWriter } from 'src/interfaces/IFileWriter';
import { IUploadCache } from 'src/interfaces/IVideoCache';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject('IUploadCache') private cacheService: IUploadCache,
    @Inject('IFileWriter') private fileWriter: IFileWriter,
  ) {};

  async processFile(file: Express.Multer.File): Promise<void> {
    try {
      await this.validateFile(file);

      const filename = file.originalname;

      await this.cacheService.cacheFile(filename, file.buffer);

      await this.fileWriter.writeFile(filename, file.buffer);

      this.logger.log(`File processed successfully: ${filename}`);

    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);

      if (error instanceof InvalidFileTypeError) {
        throw new BadRequestException(error.message);
      };

      throw new InternalServerErrorException('File processing failed');
    };
  };

  private async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BadRequestException('');
    };

    const type = await fileTypeFromBuffer(file.buffer);
    if (!type?.mime.startsWith('video/')) {
      throw new InvalidFileTypeError('Invalid file type');
    };
  };
};
