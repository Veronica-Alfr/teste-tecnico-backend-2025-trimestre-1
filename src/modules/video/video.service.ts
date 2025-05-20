import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as FileType from 'file-type';
import { IVideoCache } from 'src/interfaces/IVideoCache';
import { IFileStorage } from 'src/interfaces/IFileStorage';
import { FileTypeModule } from 'src/interfaces/IFileType';

@Injectable()
export class VideoService {
  constructor(
    @Inject('IVideoCache') private readonly videoCache: IVideoCache,
    @Inject('IFileStorage') private readonly fileStorage: IFileStorage,
  ) {}

  async getVideoStream(filename: string, rangeHeader?: string) {
    const buffer =
      (await this.videoCache.getFromCache(filename)) ||
      (await this.fileStorage.getFileBuffer(filename));

    const contentType = await this.detectContentType(buffer);
    return this.processRange(buffer, rangeHeader, contentType);
  }

  private async detectContentType(buffer: Buffer): Promise<string> {
    const type = await (FileType as unknown as FileTypeModule).fromBuffer(
      buffer,
    );
    return type?.mime || 'application/octet-stream';
  }

  private processRange(
    buffer: Buffer,
    rangeHeader?: string,
    contentType?: string,
  ) {
    const fileSize = buffer.length;
    let start = 0;
    let end = fileSize - 1;

    if (rangeHeader) {
      const [unit, range] = rangeHeader.split('=');
      if (unit !== 'bytes')
        throw new BadRequestException('Unsupported range unit');

      const parts = range.split('-');
      if (parts.length !== 2) {
        throw new BadRequestException('Invalid range format');
      }

      const startStr = parts[0];
      const endStr = parts[1];

      if (startStr === '' && endStr === '') {
        throw new BadRequestException('Invalid range values');
      }

      start = startStr === '' ? 0 : parseInt(startStr, 10);
      end = endStr === '' ? fileSize - 1 : parseInt(endStr, 10);

      if (isNaN(start) || start < 0) {
        throw new BadRequestException('Invalid range values');
      }
      if (isNaN(end) || end >= fileSize) {
        end = fileSize - 1;
      }
      if (start > end) {
        throw new BadRequestException('Invalid range values');
      }
    }

    return {
      headers: {
        'Content-Type': contentType,
        'Content-Length': end - start + 1,
        'Accept-Ranges': 'bytes',
        ...(rangeHeader && {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        }),
      },
      statusCode: rangeHeader ? 206 : 200,
      buffer: buffer.subarray(start, end + 1),
    };
  }
}
