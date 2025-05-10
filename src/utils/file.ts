import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

export class FileUtils {
  private static baseDir: string;

  static initialize(configService: ConfigService) {
    this.baseDir = configService.get<string>('VIDEOS_DIR') || join(process.cwd(), 'videos');

    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }
  }

  static getFullPath(filename: string): string {
    if (!this.baseDir) {
      throw new Error('FileUtils not initialized. Call initialize() first.');
    }
    return join(this.baseDir, filename);
  }

  static fileExists(filename: string): boolean {
    return existsSync(this.getFullPath(filename));
  }
}
