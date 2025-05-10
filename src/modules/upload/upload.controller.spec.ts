import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadController', () => {
  let controller: UploadController;
  let mockUploadService: jest.Mocked<UploadService>;

  beforeEach(async () => {
    mockUploadService = {
      processFile: jest.fn(),
    } as any;

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockFile = {
      originalname: 'test.mp4',
      mimetype: 'video/mp4',
      buffer: Buffer.from('test video data'),
      size: 1024,
    } as Express.Multer.File;

    it('should upload file successfully', async () => {
      mockUploadService.processFile.mockResolvedValueOnce(undefined);

      await expect(controller.uploadFile(mockFile)).resolves.not.toThrow();
      expect(mockUploadService.processFile).toHaveBeenCalledWith(mockFile);
    });

    it('should handle null file', async () => {
      await expect(
        controller.uploadFile(null as unknown as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
      expect(mockUploadService.processFile).not.toHaveBeenCalled();
    });

    it('should handle undefined file', async () => {
      await expect(
        controller.uploadFile(undefined as unknown as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
      expect(mockUploadService.processFile).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockUploadService.processFile.mockRejectedValueOnce(new Error('Service error'));

      await expect(controller.uploadFile(mockFile)).rejects.toThrow('Service error');
      expect(mockUploadService.processFile).toHaveBeenCalledWith(mockFile);
    });
  });
});
