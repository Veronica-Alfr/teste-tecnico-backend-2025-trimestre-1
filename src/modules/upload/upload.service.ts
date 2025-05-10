import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as FileType from 'file-type';
import { InvalidFileTypeError } from '../../custom/error/errors';
import { IFileWriter } from '../../interfaces/IFileWriter';
import { IUploadCache } from '../../interfaces/IVideoCache';
import { FileTypeModule } from 'src/interfaces/IFileType';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject('IUploadCache') private cacheService: IUploadCache,
    @Inject('IFileWriter') private fileWriter: IFileWriter,
  ) {}

  async processFile(file: Express.Multer.File): Promise<void> {
    try {
      await this.validateFile(file);

      const filename = file.originalname;

      await this.cacheService.cacheFile(filename, file.buffer);

      await this.fileWriter.writeFile(filename, file.buffer);

      this.logger.log(`File processed successfully: ${filename}`);
    } catch (error: unknown) {
      this.logger.error(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (error instanceof InvalidFileTypeError) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException('File processing failed');
    }
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BadRequestException('');
    }

    const type = await (FileType as unknown as FileTypeModule).fromBuffer(
      file.buffer,
    );
    if (!type?.mime.startsWith('video/')) {
      throw new InvalidFileTypeError('Invalid file type');
    }
  }
}
