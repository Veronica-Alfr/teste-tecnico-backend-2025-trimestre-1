import { Test, TestingModule } from '@nestjs/testing';
import { VideoCacheService } from './video-cache.service';

describe('VideoCacheService', () => {
  let service: VideoCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoCacheService],
    }).compile();

    service = module.get<VideoCacheService>(VideoCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
