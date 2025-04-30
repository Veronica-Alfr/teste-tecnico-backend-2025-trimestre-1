import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { IFileWriter } from 'src/interfaces/IFileWriter';
import { FileUtils } from 'src/utils/file';

@Injectable()
export class FileWriterService implements IFileWriter {
    async writeFile(filename: string, buffer: Buffer): Promise<void> {
        await FileUtils.ensureDirectoryExists();
        await writeFile(FileUtils.getFullPath(filename), buffer);
    };

    async ensureDirectoryExists(): Promise<void> {
        await FileUtils.ensureDirectoryExists();
    };
};
