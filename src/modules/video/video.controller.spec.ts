import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { Response } from 'express';

describe('VideoController', () => {
  let controller: VideoController;
  let videoService: VideoService;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        {
          provide: VideoService,
          useValue: {
            getVideoStream: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
    videoService = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('streamVideo', () => {
    const filename = 'test.mp4';
    const mockStreamResult = {
      buffer: Buffer.from('test video data'),
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': 1234,
        'Accept-Ranges': 'bytes',
      },
      statusCode: 200,
    };

    it('should stream video without range header', async () => {
      const spy = jest.spyOn(videoService, 'getVideoStream');
      spy.mockResolvedValueOnce(mockStreamResult);

      await controller.streamVideo(filename, '', mockResponse);

      expect(spy).toHaveBeenCalledWith(filename, '');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.set).toHaveBeenCalledWith(mockStreamResult.headers);
      expect(mockResponse.send).toHaveBeenCalledWith(mockStreamResult.buffer);
    });

    it('should stream video with range header', async () => {
      const rangeHeader = 'bytes=0-1024';
      const rangeResult = {
        ...mockStreamResult,
        headers: {
          ...mockStreamResult.headers,
          'Content-Range': 'bytes 0-1024/1234',
        },
        statusCode: 206,
      };

      const spy = jest.spyOn(videoService, 'getVideoStream');
      spy.mockResolvedValueOnce(rangeResult);

      await controller.streamVideo(filename, rangeHeader, mockResponse);

      expect(spy).toHaveBeenCalledWith(filename, rangeHeader);
      expect(mockResponse.status).toHaveBeenCalledWith(206);
      expect(mockResponse.set).toHaveBeenCalledWith(rangeResult.headers);
      expect(mockResponse.send).toHaveBeenCalledWith(rangeResult.buffer);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      const spy = jest.spyOn(videoService, 'getVideoStream');
      spy.mockRejectedValueOnce(error);

      await expect(
        controller.streamVideo(filename, '', mockResponse),
      ).rejects.toThrow(error);
    });
  });
});
