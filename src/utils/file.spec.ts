import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FileUtils } from './file';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
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
    jest.resetAllMocks();
    (FileUtils as any).baseDir = undefined;
  });

  describe('initialize', () => {
    it('should initialize with default path when VIDEOS_DIR is not set', () => {
      const defaultPath = 'process.cwd/videos';
      (configService.get as jest.Mock).mockReturnValue(undefined);
      (existsSync as jest.Mock).mockReturnValue(false);
      (join as jest.Mock).mockReturnValue(defaultPath);

      FileUtils.initialize(configService);

      expect(mkdirSync).toHaveBeenCalledWith(defaultPath, { recursive: true });
      expect(FileUtils.getFullPath('test.mp4')).toBe(`${defaultPath}/test.mp4`);
    });

    it('should initialize with custom path from config', () => {
      const customPath = '/custom/path';
      (configService.get as jest.Mock).mockReturnValue(customPath);
      (existsSync as jest.Mock).mockReturnValue(false);
      (join as jest.Mock).mockReturnValue(customPath);

      FileUtils.initialize(configService);

      expect(mkdirSync).toHaveBeenCalledWith(customPath, { recursive: true });
      expect(FileUtils.getFullPath('test.mp4')).toBe(`${customPath}/test.mp4`);
    });

    it('should not create directory if it already exists', () => {
      const customPath = '/custom/path';
      (configService.get as jest.Mock).mockReturnValue(customPath);
      (existsSync as jest.Mock).mockReturnValue(true);
      (join as jest.Mock).mockReturnValue(customPath);

      FileUtils.initialize(configService);

      expect(mkdirSync).not.toHaveBeenCalled();
      expect(FileUtils.getFullPath('test.mp4')).toBe(`${customPath}/test.mp4`);
    });

    it('should handle directory creation error gracefully', () => {
      const customPath = '/custom/path';
      (configService.get as jest.Mock).mockReturnValue(customPath);
      (existsSync as jest.Mock).mockReturnValue(false);
      (join as jest.Mock).mockReturnValue(customPath);
      (mkdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => FileUtils.initialize(configService)).toThrow(
        'Permission denied',
      );
    });
  });

  describe('getFullPath', () => {
    it('should throw error when not initialized', () => {
      expect(() => FileUtils.getFullPath('test.mp4')).toThrow(
        'FileUtils not initialized. Call initialize() first.',
      );
    });

    it('should return full path when initialized', () => {
      const customPath = '/custom/path';
      (configService.get as jest.Mock).mockReturnValue(customPath);
      (existsSync as jest.Mock).mockReturnValue(true);
      (join as jest.Mock).mockReturnValue(customPath);

      FileUtils.initialize(configService);
      expect(FileUtils.getFullPath('test.mp4')).toBe(`${customPath}/test.mp4`);
    });
  });

  describe('fileExists', () => {
    it('should check if file exists', () => {
      const customPath = '/custom/path';
      (configService.get as jest.Mock).mockReturnValue(customPath);
      (existsSync as jest.Mock).mockReturnValue(true);
      (join as jest.Mock).mockReturnValue(customPath);

      FileUtils.initialize(configService);
      expect(FileUtils.fileExists('test.mp4')).toBe(true);
      expect(existsSync).toHaveBeenCalledWith(`${customPath}/test.mp4`);
    });

    it('should return false when file does not exist', () => {
      const customPath = '/custom/path';
      (configService.get as jest.Mock).mockReturnValue(customPath);
      (existsSync as jest.Mock).mockReturnValue(false);
      (join as jest.Mock).mockReturnValue(customPath);

      FileUtils.initialize(configService);
      expect(FileUtils.fileExists('test.mp4')).toBe(false);
      expect(existsSync).toHaveBeenCalledWith(`${customPath}/test.mp4`);
    });
  });
});
