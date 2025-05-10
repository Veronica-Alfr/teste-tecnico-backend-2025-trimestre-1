import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FileUtils } from './file';
import { existsSync } from 'fs';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

describe('FileUtils', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
    // Reset FileUtils state
    (FileUtils as any).baseDir = undefined;
  });

  describe('initialize', () => {
    it('should initialize with default path when VIDEOS_DIR is not set', () => {
      (configService.get as jest.Mock).mockReturnValue(undefined);
      FileUtils.initialize(configService);
      expect(FileUtils.getFullPath('test.mp4')).toBe('/app/videos/test.mp4');
    });

    it('should initialize with custom path from config', () => {
      (configService.get as jest.Mock).mockReturnValue('/custom/path');
      FileUtils.initialize(configService);
      expect(FileUtils.getFullPath('test.mp4')).toBe('/custom/path/test.mp4');
    });
  });

  describe('getFullPath', () => {
    it('should throw error when not initialized', () => {
      expect(() => FileUtils.getFullPath('test.mp4')).toThrow(
        'FileUtils not initialized. Call initialize() first.',
      );
    });

    it('should return full path when initialized', () => {
      FileUtils.initialize(configService);
      expect(FileUtils.getFullPath('test.mp4')).toBe('/app/videos/test.mp4');
    });
  });

  describe('fileExists', () => {
    it('should check if file exists', () => {
      FileUtils.initialize(configService);
      (existsSync as jest.Mock).mockReturnValue(true);
      expect(FileUtils.fileExists('test.mp4')).toBe(true);
      expect(existsSync).toHaveBeenCalledWith('/app/videos/test.mp4');
    });

    it('should return false when file does not exist', () => {
      FileUtils.initialize(configService);
      (existsSync as jest.Mock).mockReturnValue(false);
      expect(FileUtils.fileExists('test.mp4')).toBe(false);
      expect(existsSync).toHaveBeenCalledWith('/app/videos/test.mp4');
    });
  });
}); 