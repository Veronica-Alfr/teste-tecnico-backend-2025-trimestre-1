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

    it('should throw InternalServerErrorException when file is null', async () => {
      await expect(
        service.processFile(undefined as unknown as Express.Multer.File),
      ).rejects.toThrow(InternalServerErrorException);
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
  });
});
