import { Test, TestingModule } from '@nestjs/testing';
import { FileWriterService } from './file-writer.service';
import { FileUtils } from '../../utils/file';
import * as fsPromises from 'fs/promises';

jest.mock('fs/promises');
jest.mock('../../utils/file');

describe('FileWriterService', () => {
  let service: FileWriterService;
  const mockGetFullPath = jest.fn();
  const mockWriteFile = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileWriterService],
    }).compile();

    service = module.get<FileWriterService>(FileWriterService);
    jest.clearAllMocks();

    (FileUtils.getFullPath as jest.Mock) = mockGetFullPath;
    (fsPromises.writeFile as jest.Mock) = mockWriteFile;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('writeFile', () => {
    it('should write file successfully', async () => {
      const filename = 'test.mp4';
      const buffer = Buffer.from('test data');
      const fullPath = '/path/to/test.mp4';

      mockGetFullPath.mockReturnValue(fullPath);
      mockWriteFile.mockResolvedValueOnce(undefined);

      await service.writeFile(filename, buffer);

      expect(mockGetFullPath).toHaveBeenCalledWith(filename);
      expect(mockWriteFile).toHaveBeenCalledWith(fullPath, buffer);
    });

    it('should handle write error', async () => {
      const filename = 'test.mp4';
      const buffer = Buffer.from('test data');
      const fullPath = '/path/to/test.mp4';
      const error = new Error('Write failed');

      mockGetFullPath.mockReturnValue(fullPath);
      mockWriteFile.mockRejectedValueOnce(error);

      await expect(service.writeFile(filename, buffer)).rejects.toThrow(error);
      expect(mockGetFullPath).toHaveBeenCalledWith(filename);
      expect(mockWriteFile).toHaveBeenCalledWith(fullPath, buffer);
    });

    it('should handle empty buffer', async () => {
      const filename = 'test.mp4';
      const buffer = Buffer.from('');
      const fullPath = '/path/to/test.mp4';

      mockGetFullPath.mockReturnValue(fullPath);
      mockWriteFile.mockResolvedValueOnce(undefined);

      await service.writeFile(filename, buffer);

      expect(mockGetFullPath).toHaveBeenCalledWith(filename);
      expect(mockWriteFile).toHaveBeenCalledWith(fullPath, buffer);
    });
  });
});
