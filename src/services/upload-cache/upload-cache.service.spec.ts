import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UploadCacheService } from './upload-cache.service';
import { Cache } from 'cache-manager';

describe('UploadCacheService', () => {
  let service: UploadCacheService;
  let cacheManager: Cache;

  const mockCacheManager = {
    set: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<UploadCacheService>(UploadCacheService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(cacheManager).toBeDefined();
  });

  describe('cacheFile', () => {
    it('should cache a file with the correct key and TTL', async () => {
      const key = 'test-key';
      const buffer = Buffer.from('test data');

      await service.cacheFile(key, buffer);

      expect(cacheManager.set).toHaveBeenCalledWith(
        `video:${key}`,
        buffer,
        60000,
      );
    });

    it('should handle empty buffer', async () => {
      const key = 'test-key';
      const buffer = Buffer.from('');

      await service.cacheFile(key, buffer);

      expect(cacheManager.set).toHaveBeenCalledWith(
        `video:${key}`,
        buffer,
        60000,
      );
    });

    it('should handle cache set error', async () => {
      const key = 'test-key';
      const buffer = Buffer.from('test data');
      const error = new Error('Cache set failed');

      mockCacheManager.set.mockRejectedValueOnce(error);

      await expect(service.cacheFile(key, buffer)).rejects.toThrow(error);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `video:${key}`,
        buffer,
        60000,
      );
    });
  });

  describe('deleteFromCache', () => {
    it('should delete a file from cache with the correct key', async () => {
      const key = 'test-key';

      await service.deleteFromCache(key);

      expect(cacheManager.del).toHaveBeenCalledWith(`video:${key}`);
    });

    it('should handle cache delete error', async () => {
      const key = 'test-key';
      const error = new Error('Cache delete failed');

      mockCacheManager.del.mockRejectedValueOnce(error);

      await expect(service.deleteFromCache(key)).rejects.toThrow(error);
      expect(cacheManager.del).toHaveBeenCalledWith(`video:${key}`);
    });
  });
});
