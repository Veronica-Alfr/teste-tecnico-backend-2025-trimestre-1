import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { InvalidRangeError } from '../../custom/error/errors';
import {
  FileTypeModule,
  FileTypeResult,
} from '../__mocks__/file-type.types';

jest.mock('file-type', () => {
  const mockFn = jest.fn<Promise<FileTypeResult | undefined>, [Buffer]>();
  return {
    __esModule: true,
    fromBuffer: mockFn,
  };
});

const mockFileTypeFromBuffer =
  jest.requireMock<FileTypeModule>('file-type').fromBuffer;

describe('VideoService', () => {
  let service: VideoService;
  const mockVideoCache = {
    getFromCache: jest.fn(),
  };
  const mockFileStorage = {
    getFileBuffer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: 'IVideoCache',
          useValue: mockVideoCache,
        },
        {
          provide: 'IFileStorage',
          useValue: mockFileStorage,
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVideoStream', () => {
    const mockBuffer = Buffer.from('test video data');
    const filename = 'test.mp4';

    it('should get video from cache', async () => {
      mockVideoCache.getFromCache.mockResolvedValueOnce(mockBuffer);
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });

      const result = await service.getVideoStream(filename);

      expect(mockVideoCache.getFromCache).toHaveBeenCalledWith(filename);
      expect(mockFileStorage.getFileBuffer).not.toHaveBeenCalled();
      expect(result.headers['Content-Type']).toBe('video/mp4');
      expect(result.statusCode).toBe(200);
    });

    it('should get video from storage if not in cache', async () => {
      mockVideoCache.getFromCache.mockResolvedValueOnce(null);
      mockFileStorage.getFileBuffer.mockResolvedValueOnce(mockBuffer);
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });

      const result = await service.getVideoStream(filename);

      expect(mockVideoCache.getFromCache).toHaveBeenCalledWith(filename);
      expect(mockFileStorage.getFileBuffer).toHaveBeenCalledWith(filename);
      expect(result.headers['Content-Type']).toBe('video/mp4');
      expect(result.statusCode).toBe(200);
    });

    it('should handle range request correctly', async () => {
      mockVideoCache.getFromCache.mockResolvedValueOnce(mockBuffer);
      mockFileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'video/mp4',
      });

      const result = await service.getVideoStream(filename, 'bytes=0-1024');

      expect(result.headers['Content-Range']).toBeDefined();
      expect(result.statusCode).toBe(206);
    });

    it('should throw InvalidRangeError for invalid range unit', async () => {
      mockVideoCache.getFromCache.mockResolvedValueOnce(mockBuffer);

      await expect(
        service.getVideoStream(filename, 'invalid=0-1024'),
      ).rejects.toThrow(InvalidRangeError);
    });

    it('should throw InvalidRangeError for invalid range values', async () => {
      mockVideoCache.getFromCache.mockResolvedValueOnce(mockBuffer);

      await expect(
        service.getVideoStream(filename, 'bytes=1024-0'),
      ).rejects.toThrow(InvalidRangeError);
    });

    it('should use default content type when file type is not detected', async () => {
      mockVideoCache.getFromCache.mockResolvedValueOnce(mockBuffer);
      mockFileTypeFromBuffer.mockResolvedValueOnce(undefined);

      const result = await service.getVideoStream(filename);

      expect(result.headers['Content-Type']).toBe('application/octet-stream');
    });
  });
});
