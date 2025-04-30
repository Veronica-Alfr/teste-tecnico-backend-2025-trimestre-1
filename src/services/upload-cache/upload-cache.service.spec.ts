import { Test, TestingModule } from '@nestjs/testing';
import { UploadCacheService } from './upload-cache.service';

describe('UploadCacheService', () => {
  let service: UploadCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadCacheService],
    }).compile();

    service = module.get<UploadCacheService>(UploadCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
