import { Test, TestingModule } from '@nestjs/testing';
import { FileStorageService } from './file-storage.service';
import { FileUtils } from '../../utils/file';
import { VideoNotFoundError } from '../../custom/error/errors';
import * as fsPromises from 'fs/promises';

jest.mock('fs/promises');
jest.mock('../../utils/file');

describe('FileStorageService', () => {
  let service: FileStorageService;
  const mockFileExists = jest.fn();
  const mockGetFullPath = jest.fn();
  const mockReadFile = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileStorageService],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
    jest.clearAllMocks();

    (FileUtils.fileExists as jest.Mock) = mockFileExists;
    (FileUtils.getFullPath as jest.Mock) = mockGetFullPath;
    (fsPromises.readFile as jest.Mock) = mockReadFile;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFileBuffer', () => {
    it('should return file buffer when file exists', async () => {
      const filename = 'test.mp4';
      const fullPath = '/path/to/test.mp4';
      const expectedBuffer = Buffer.from('test data');

      mockFileExists.mockReturnValue(true);
      mockGetFullPath.mockReturnValue(fullPath);
      mockReadFile.mockResolvedValueOnce(expectedBuffer);

      const result = await service.getFileBuffer(filename);

      expect(mockFileExists).toHaveBeenCalledWith(filename);
      expect(mockGetFullPath).toHaveBeenCalledWith(filename);
      expect(mockReadFile).toHaveBeenCalledWith(fullPath);
      expect(result).toEqual(expectedBuffer);
    });

    it('should throw VideoNotFoundError when file does not exist', async () => {
      const filename = 'nonexistent.mp4';

      mockFileExists.mockReturnValue(false);

      await expect(service.getFileBuffer(filename)).rejects.toThrow(
        VideoNotFoundError,
      );
      expect(mockFileExists).toHaveBeenCalledWith(filename);
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('should handle read error', async () => {
      const filename = 'test.mp4';
      const fullPath = '/path/to/test.mp4';
      const error = new Error('Read failed');

      mockFileExists.mockReturnValue(true);
      mockGetFullPath.mockReturnValue(fullPath);
      mockReadFile.mockRejectedValueOnce(error);

      await expect(service.getFileBuffer(filename)).rejects.toThrow(error);
      expect(mockFileExists).toHaveBeenCalledWith(filename);
      expect(mockGetFullPath).toHaveBeenCalledWith(filename);
      expect(mockReadFile).toHaveBeenCalledWith(fullPath);
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', () => {
      const filename = 'test.mp4';
      mockFileExists.mockReturnValue(true);

      const result = service.fileExists(filename);

      expect(mockFileExists).toHaveBeenCalledWith(filename);
      expect(result).toBe(true);
    });

    it('should return false when file does not exist', () => {
      const filename = 'nonexistent.mp4';
      mockFileExists.mockReturnValue(false);

      const result = service.fileExists(filename);

      expect(mockFileExists).toHaveBeenCalledWith(filename);
      expect(result).toBe(false);
    });
  });
});
