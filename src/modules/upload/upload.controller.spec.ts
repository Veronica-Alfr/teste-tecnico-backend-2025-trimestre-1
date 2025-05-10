import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';

jest.mock('./upload.service', () => {
  return {
    UploadService: jest.fn().mockImplementation(() => ({
      processFile: jest.fn(),
    })),
  };
});

describe('UploadController', () => {
  let controller: UploadController;

  const mockUploadService = {
    processFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockFile = {
      originalname: 'test.mp4',
      buffer: Buffer.from('test video data'),
    } as Express.Multer.File;

    it('should process file successfully', async () => {
      mockUploadService.processFile.mockResolvedValueOnce(undefined);

      await controller.uploadFile(mockFile);

      expect(mockUploadService.processFile).toHaveBeenCalledWith(mockFile);
    });

    it('should throw BadRequestException when file is invalid', async () => {
      const invalidFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('invalid file'),
      } as Express.Multer.File;

      mockUploadService.processFile.mockRejectedValueOnce(
        new BadRequestException(),
      );

      await expect(controller.uploadFile(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUploadService.processFile).toHaveBeenCalledWith(invalidFile);
    });

    it('should handle null file', async () => {
      mockUploadService.processFile.mockRejectedValueOnce(
        new BadRequestException(),
      );

      await expect(
        controller.uploadFile(undefined as unknown as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
      expect(mockUploadService.processFile).toHaveBeenCalledWith(undefined);
    });
  });
});
