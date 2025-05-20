export interface IFileStorage {
  getFileBuffer(filename: string): Promise<Buffer>;
  fileExists(filename: string): boolean;
  writeFile(filename: string, buffer: Buffer): Promise<void>;
}
