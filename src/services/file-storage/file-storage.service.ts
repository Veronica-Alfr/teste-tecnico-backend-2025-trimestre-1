import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { VideoNotFoundError } from '../../custom/error/errors';
import { IFileStorage } from '../../interfaces/IFileStorage';
import { FileUtils } from '../../utils/file';

@Injectable()
export class FileStorageService implements IFileStorage {
  async getFileBuffer(filename: string): Promise<Buffer> {
    if (!FileUtils.fileExists(filename)) {
      throw new VideoNotFoundError();
    }
    return readFile(FileUtils.getFullPath(filename));
  }

  fileExists(filename: string): boolean {
    return FileUtils.fileExists(filename);
  }

  async writeFile(filename: string, buffer: Buffer): Promise<void> {
    await writeFile(FileUtils.getFullPath(filename), buffer);
  }
}
