import { existsSync, promises as fs } from 'fs';
import { join } from 'path';

export class FileUtils {
    private static readonly baseDir = '/app/videos';

    static getFullPath(filename: string): string {
        return join(this.baseDir, filename);
    };

    static fileExists(filename: string): boolean {
        return existsSync(this.getFullPath(filename));
    };
};
