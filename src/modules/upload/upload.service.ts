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
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      this.logger.debug(`Processing file: ${JSON.stringify({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      })}`);

      await this.validateFile(file);

      const filename = file.originalname;

      try {
        this.logger.debug(`Caching file: ${filename}`);
        await this.cacheService.cacheFile(filename, file.buffer);
      } catch (error) {
        this.logger.error(`Cache error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw new InternalServerErrorException('Failed to cache file');
      }

      try {
        this.logger.debug(`Writing file: ${filename}`);
        await this.fileWriter.writeFile(filename, file.buffer);
      } catch (error) {
        this.logger.error(`Write error: ${error.message}`);
        throw new InternalServerErrorException('Failed to write file');
      }

      this.logger.log(`File processed successfully: ${filename}`);
    } catch (error: unknown) {
      this.logger.error(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined
      );

      if (error instanceof InvalidFileTypeError || error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException('File processing failed');
    }
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file');
    }

    this.logger.debug(`Validating file type: ${file.mimetype}`);
    const fileType = await (FileType as unknown as FileTypeModule).fromBuffer(file.buffer);
    
    if (!fileType || !fileType.mime.startsWith('video/')) {
      this.logger.error(`Invalid file type: ${fileType?.mime || 'unknown'}`);
      throw new InvalidFileTypeError('Invalid file type. Only video files are allowed.');
    }

    const allowedExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      this.logger.error(`Invalid file extension: ${fileExtension}`);
      throw new InvalidFileTypeError('Invalid file extension. Allowed extensions: ' + allowedExtensions.join(', '));
    }
  }
}
