import { Inject, Injectable } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { IVideoCache } from 'src/interfaces/IVideoCache';
import { IFileStorage } from 'src/interfaces/IFileStorage';
import { InvalidRangeError, VideoNotFoundError } from 'src/custom/error/errors';

@Injectable()
export class VideoService {
constructor(
    @Inject('IVideoCache') private readonly videoCache: IVideoCache,
    @Inject('IFileStorage') private readonly fileStorage: IFileStorage,
) {};

    async getVideoStream(filename: string, rangeHeader?: string) {
        let buffer = await this.videoCache.getFromCache(filename);

        if (!buffer) {
            buffer = await this.fileStorage.getFileBuffer(filename);
            await this.videoCache.setToCache(filename, buffer);
        };
    
        const contentType = await this.detectContentType(buffer);
        return this.processRange(buffer, rangeHeader, contentType);
    };

    private async detectContentType(buffer: Buffer): Promise<string> {
        const type = await fileTypeFromBuffer(buffer);
        return type?.mime || 'application/octet-stream';
    };

    private processRange(buffer: Buffer, rangeHeader?: string, contentType?: string) {
        const fileSize = buffer.length;
        let start = 0;
        let end = fileSize - 1;

        if (rangeHeader) {
            const [unit, range] = rangeHeader.split('=');
            if (unit !== 'bytes') throw new InvalidRangeError('Unsupported range unit');

            const parts = range.split('-');
            start = Number.isNaN(parseInt(parts[0], 10)) ? 0 : parseInt(parts[0], 10);
            end = Number.isNaN(parseInt(parts[1], 10)) ? fileSize - 1 : parseInt(parts[1], 10);

            if (isNaN(start) || start < 0) start = 0;
            if (isNaN(end) || end >= fileSize) end = fileSize - 1;
            if (start > end) throw new InvalidRangeError('Invalid range values');
        };

        return {
            headers: {
            'Content-Type': contentType,
            'Content-Length': end - start + 1,
            'Accept-Ranges': 'bytes',
            ...(rangeHeader && {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`
                })
            },
            statusCode: rangeHeader ? 206 : 200,
            buffer: buffer.subarray(start, end + 1)
        };
    };
};
