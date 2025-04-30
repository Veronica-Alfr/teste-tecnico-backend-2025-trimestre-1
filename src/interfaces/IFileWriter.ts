export interface IFileWriter {
    writeFile(filename: string, buffer: Buffer): Promise<void>;
    ensureDirectoryExists(): Promise<void>;
};
