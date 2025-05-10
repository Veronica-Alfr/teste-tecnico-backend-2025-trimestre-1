import { Controller, Get, Param, Headers, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { VideoService } from './video.service';

@Controller('static')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('video/:filename')
  @Header('Accept-Ranges', 'bytes')
  async streamVideo(
    @Param('filename') filename: string,
    @Headers('range') range: string,
    @Res() res: Response,
  ) {
    const { buffer, headers, statusCode } =
      await this.videoService.getVideoStream(filename, range);
    res.status(statusCode).set(headers);
    return res.send(buffer);
  }
}
