import { existsSync, promises as fs } from 'fs';
import { join } from 'path';

export class FileUtils {
    private static readonly baseDir = join(process.cwd(), 'videos');

    static getFullPath(filename: string): string {
        return join(this.baseDir, filename);
    };

    static async ensureDirectoryExists(): Promise<void> {
        if (!existsSync(this.baseDir)) {
            await fs.mkdir(this.baseDir, { recursive: true });
        };
    };

    static fileExists(filename: string): boolean {
        return existsSync(this.getFullPath(filename));
    };
};
