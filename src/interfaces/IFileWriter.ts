export interface IFileWriter {
    writeFile(filename: string, buffer: Buffer): Promise<void>;
};
