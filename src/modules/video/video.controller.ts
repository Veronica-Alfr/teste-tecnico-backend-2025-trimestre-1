import { Controller, Get, Header, Param, Req, Res } from '@nestjs/common';
import { VideoService } from './video.service';
import { Request, Response } from 'express';

@Controller('static/video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {};

  @Get(':filename')
  async streamVideo(@Param('filename') filename: string, @Req() req: Request, @Res() res: Response) {
    const rangeHeader = req.headers.range;

    const { status, headers, stream } = await this.videoService.getVideoStream(filename, rangeHeader);

    res.writeHead(status, headers);
    stream.pipe(res);
  };
};
