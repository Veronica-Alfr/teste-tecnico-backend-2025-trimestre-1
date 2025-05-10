import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileTypeModule, FileTypeResult } from '../__mocks__/file-type.types';

jest.mock('file-type', () => {
  const mockFn = jest.fn<Promise<FileTypeResult | undefined>, [Buffer]>();
  return {
    __esModule: true,
    fromBuffer: mockFn,
  };
});

const mockFileTypeFromBuffer =
  jest.requireMock<FileTypeModule>('file-type').fromBuffer;

describe('UploadService', () => {
  let service: UploadService;
  const mockCacheService = {
    cacheFile: jest.fn(),
  };
  const mockFileWriter = {
    writeFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: 'IUploadCache',
          useValue: mockCacheService,
        },
        {
          provide: 'IFileWriter',
          useValue: mockFileWriter,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processFile', () => {
    const mockFile = {
      originalname: 'test.mp4',
      buffer: Buffer.from('test video data'),
      fieldname: 'file',
      encoding: '7bit',
      mimetype: 'video/mp4',
      size: 1024,
      destination: '/tmp',
      filename: 'test.mp4',
      path: '/tmp/test.mp4',
      stream: {} as any,
    } as Express.Multer.File;

    it('should process file successfully', async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });
      mockCacheService.cacheFile.mockResolvedValueOnce(undefined);
      mockFileWriter.writeFile.mockResolvedValueOnce(undefined);

      await service.processFile(mockFile);

      expect(mockFileTypeFromBuffer).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockCacheService.cacheFile).toHaveBeenCalledWith(
        mockFile.originalname,
        mockFile.buffer,
      );
      expect(mockFileWriter.writeFile).toHaveBeenCalledWith(
        mockFile.originalname,
        mockFile.buffer,
      );
    });

    it('should throw BadRequestException when file is null', async () => {
      await expect(
        service.processFile(undefined as unknown as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid file type', async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'image/jpeg',
      });

      await expect(service.processFile(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCacheService.cacheFile).not.toHaveBeenCalled();
      expect(mockFileWriter.writeFile).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when cache fails', async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });
      mockCacheService.cacheFile.mockRejectedValueOnce(
        new Error('Cache failed'),
      );

      await expect(service.processFile(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockFileWriter.writeFile).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when file write fails', async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });
      mockCacheService.cacheFile.mockResolvedValueOnce(undefined);
      mockFileWriter.writeFile.mockRejectedValueOnce(new Error('Write failed'));

      await expect(service.processFile(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw BadRequestException when file has no buffer', async () => {
      const fileWithoutBuffer = {
        originalname: 'test.mp4',
        buffer: null,
      } as unknown as Express.Multer.File;

      await expect(service.processFile(fileWithoutBuffer)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockFileTypeFromBuffer).not.toHaveBeenCalled();
      expect(mockCacheService.cacheFile).not.toHaveBeenCalled();
      expect(mockFileWriter.writeFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when fileType is undefined', async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce(undefined);

      await expect(service.processFile(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCacheService.cacheFile).not.toHaveBeenCalled();
      expect(mockFileWriter.writeFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid file extension', async () => {
      const fileWithInvalidExtension = {
        originalname: 'test.txt',
        buffer: Buffer.from('test video data'),
      } as unknown as Express.Multer.File;

      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });

      await expect(service.processFile(fileWithInvalidExtension)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCacheService.cacheFile).not.toHaveBeenCalled();
      expect(mockFileWriter.writeFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is invalid', async () => {
      const invalidFile = {
        originalname: 'test.mp4',
        buffer: null,
      } as unknown as Express.Multer.File;

      await expect(service.processFile(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockFileTypeFromBuffer).not.toHaveBeenCalled();
      expect(mockCacheService.cacheFile).not.toHaveBeenCalled();
      expect(mockFileWriter.writeFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file has no extension', async () => {
      const fileWithoutExtension = {
        originalname: 'test',
        buffer: Buffer.from('test video data'),
      } as unknown as Express.Multer.File;

      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });

      await expect(service.processFile(fileWithoutExtension)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCacheService.cacheFile).not.toHaveBeenCalled();
      expect(mockFileWriter.writeFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file has empty extension', async () => {
      const fileWithEmptyExtension = {
        originalname: 'test.',
        buffer: Buffer.from('test video data'),
      } as unknown as Express.Multer.File;

      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });

      await expect(service.processFile(fileWithEmptyExtension)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCacheService.cacheFile).not.toHaveBeenCalled();
      expect(mockFileWriter.writeFile).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException for unknown error type', async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });
      mockCacheService.cacheFile.mockRejectedValueOnce(new Error('Unknown error'));
      
      class CustomError extends Error {
        constructor() {
          super('Custom error');
          this.name = 'CustomError';
        }
      }

      mockCacheService.cacheFile.mockRejectedValueOnce(new CustomError());

      await expect(service.processFile(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle non-Error objects in cache error', async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });
      mockCacheService.cacheFile.mockRejectedValueOnce('String error message');

      await expect(service.processFile(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle non-Error objects in write error', async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });
      mockCacheService.cacheFile.mockResolvedValueOnce(undefined);
      mockFileWriter.writeFile.mockRejectedValueOnce('String error message');

      await expect(service.processFile(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle non-Error objects in general error handling', async () => {
      mockFileTypeFromBuffer.mockImplementationOnce(() => {
        throw 'Non-error object thrown';
      });

      await expect(service.processFile(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle Error objects without stack trace', async () => {
      const errorWithoutStack = new Error('Error without stack');
      delete errorWithoutStack.stack;
      
      mockFileTypeFromBuffer.mockImplementationOnce(() => {
        throw errorWithoutStack;
      });

      await expect(service.processFile(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
