import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VideoCacheService } from './video-cache.service';
import { Cache } from 'cache-manager';

describe('VideoCacheService', () => {
  let service: VideoCacheService;
  let cacheManager: Cache;

  const mockCacheManager = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<VideoCacheService>(VideoCacheService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(cacheManager).toBeDefined();
  });

  describe('getFromCache', () => {
    it('should retrieve a file from cache with the correct key', async () => {
      const filename = 'test-video.mp4';
      const expectedBuffer = Buffer.from('test video data');

      mockCacheManager.get.mockResolvedValueOnce(expectedBuffer);

      const result = await service.getFromCache(filename);

      expect(cacheManager.get).toHaveBeenCalledWith(`video:${filename}`);
      expect(result).toEqual(expectedBuffer);
    });

    it('should return null when file is not in cache', async () => {
      const filename = 'non-existent.mp4';

      mockCacheManager.get.mockResolvedValueOnce(null);

      const result = await service.getFromCache(filename);

      expect(cacheManager.get).toHaveBeenCalledWith(`video:${filename}`);
      expect(result).toBeNull();
    });

    it('should handle cache get error', async () => {
      const filename = 'test-video.mp4';
      const error = new Error('Cache get failed');

      mockCacheManager.get.mockRejectedValueOnce(error);

      await expect(service.getFromCache(filename)).rejects.toThrow(error);
      expect(cacheManager.get).toHaveBeenCalledWith(`video:${filename}`);
    });

    it('should handle empty filename', async () => {
      const filename = '';

      mockCacheManager.get.mockResolvedValueOnce(null);

      const result = await service.getFromCache(filename);

      expect(cacheManager.get).toHaveBeenCalledWith('video:');
      expect(result).toBeNull();
    });
  });
});
