import { Injectable, NotFoundException } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { IFileStorage } from '../../interfaces/IFileStorage';
import { FileUtils } from '../../utils/file';

@Injectable()
export class FileStorageService implements IFileStorage {
  async getFileBuffer(filename: string): Promise<Buffer> {
    if (!FileUtils.fileExists(filename)) {
      throw new NotFoundException('File not found');
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
