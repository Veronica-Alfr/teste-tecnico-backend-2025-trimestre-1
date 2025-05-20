import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as FileType from 'file-type';
import { IFileWriter } from '../../interfaces/IFileWriter';
import { IVideoCache } from '../../interfaces/IVideoCache';
import { FileTypeModule } from '../../interfaces/IFileType';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject('IVideoCache') private cacheService: IVideoCache,
    @Inject('IFileWriter') private fileWriter: IFileWriter,
  ) {}

  async processFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logger.debug(
      `Processing file: ${JSON.stringify({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })}`,
    );

    await this.validateFile(file);
    const filename = file.originalname;

    this.logger.debug(`Caching file: ${filename}`);
    await this.cacheService.cacheFile(filename, file.buffer);

    this.logger.debug(`Writing file: ${filename}`);
    await this.fileWriter.writeFile(filename, file.buffer);

    this.logger.log(`File processed successfully: ${filename}`);
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file');
    }

    this.logger.debug(`Validating file type: ${file.mimetype}`);
    const fileType = await (FileType as unknown as FileTypeModule).fromBuffer(
      file.buffer,
    );

    if (!fileType || !fileType.mime.startsWith('video/')) {
      this.logger.error(`Invalid file type: ${fileType?.mime || 'unknown'}`);
      throw new BadRequestException(
        'Invalid file type. Only video files are allowed.',
      );
    }

    const allowedExtensions = [
      '.mp4',
      '.avi',
      '.mkv',
      '.mov',
      '.wmv',
      '.flv',
      '.webm',
    ];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      this.logger.error(`Invalid file extension: ${fileExtension}`);
      throw new BadRequestException(
        'Invalid file extension. Allowed extensions: ' +
          allowedExtensions.join(', '),
      );
    }
  }
}
