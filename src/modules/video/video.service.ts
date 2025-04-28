import { Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Readable } from 'stream';

@Injectable()
export class VideoService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {};

    private getFileInfo(filename: string) {
        const filePath = join(process.cwd(), 'videos', filename);

        try {
            const stats = statSync(filePath);
            return { filePath, size: stats.size };
        } catch {
            throw new NotFoundException('File Not Found!');
        }
    };

    async getVideoStream(filename: string, rangeHeader?: string) {
    // const cachedFile: Buffer | null = await this.cacheManager.get<Buffer>(filename);
    const base64Data = await this.cacheManager.get<string>(filename);
    const cachedFile = base64Data ? Buffer.from(base64Data, 'base64') : null
    // console.log('cachedFile AQUI =>', cachedFile); 

    console.log(`Checking cache for name: ${filename}`, cachedFile ? 'Found' : 'Not found');

    if (cachedFile) {
        const size = cachedFile.length;
        if (!rangeHeader) {
            const stream = Readable.from(cachedFile);
            return {
                status: 200,
                headers: {
                'Content-Length': size,
                'Content-Type': 'video/mp4',
                'Accept-Ranges': 'bytes',
                },
                stream,
            };
        };

        const [unit, range] = rangeHeader.split('=');
            if (unit !== 'bytes') {
            throw new NotFoundException('Invalid Range');
        };

        const [startStr, endStr] = range.split('-');
        let start = parseInt(startStr, 10);
        let end = endStr ? parseInt(endStr, 10) : size - 1;

        if (isNaN(start) || start < 0) start = 0;
        if (isNaN(end) || end >= size) end = size - 1;
        if (start > end) {
            throw new NotFoundException('Invalid Range');
        }

        const chunk = cachedFile.slice(start, end + 1);
        const stream = Readable.from(chunk);

        return {
        status: 206,
        headers: {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunk.length,
            'Content-Type': 'video/mp4',
        },
        stream,
        };
    };

    const { filePath, size } = this.getFileInfo(filename);

    if (!rangeHeader) {
        const stream = createReadStream(filePath);
        return {
        status: 200,
        headers: {
            'Content-Length': size,
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes',
        },
        stream,
        };
    }

    const [unit, range] = rangeHeader.split('=');
    if (unit !== 'bytes') {
        throw new NotFoundException('Invalid Range');
    };

    const [startStr, endStr] = range.split('-');
    let start = parseInt(startStr, 10);
    let end = endStr ? parseInt(endStr, 10) : size - 1;

    if (isNaN(start) || start < 0) start = 0;
    if (isNaN(end) || end >= size) end = size - 1;
    if (start > end) {
        throw new NotFoundException('Invalid Range');
    };

    const stream = createReadStream(filePath, { start, end });

    return {
            status: 206,
            headers: {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': 'video/mp4',
            },
            stream,
        };
    };
};
