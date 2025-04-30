import { Test, TestingModule } from '@nestjs/testing';
import { FileWriterService } from './file-writer.service';

describe('FileWriterService', () => {
  let service: FileWriterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileWriterService],
    }).compile();

    service = module.get<FileWriterService>(FileWriterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
