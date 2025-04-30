export interface IFileStorage {
    getFileBuffer(filename: string): Promise<Buffer>;
    fileExists(filename: string): boolean;
};
