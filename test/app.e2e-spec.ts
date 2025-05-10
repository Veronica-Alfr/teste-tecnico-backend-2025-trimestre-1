import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { join } from 'path';
import { createReadStream, mkdirSync } from 'fs';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';

describe('Video Upload (e2e)', () => {
  let app: INestApplication;
  const testVideosDir = join(__dirname, 'videos');

  beforeAll(async () => {
    mkdirSync(testVideosDir, { recursive: true });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    const configService = app.get(ConfigService);
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'VIDEOS_DIR') return testVideosDir;
      return configService.get(key);
    });

    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should upload a video file', async () => {
    const videoPath = join(__dirname, 'fixtures', 'Your_Blip_ChatBot.mp4');
    const videoStream = createReadStream(videoPath);

    await request(app.getHttpServer())
      .post('/upload/video')
      .attach('video', videoStream, {
        filename: 'Your_Blip_ChatBot.mp4',
        contentType: 'video/mp4'
      })
      .expect(204);
  });

  it('should reject invalid file type', async () => {
    const imagePath = join(__dirname, 'fixtures', 'start_button.png');
    const imageStream = createReadStream(imagePath);

    const response = await request(app.getHttpServer())
      .post('/upload/video')
      .attach('video', imageStream, {
        filename: 'start_button.png',
        contentType: 'image/png'
      })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Bad Request');
    expect(response.body.message).toBe('Invalid file type. Only video files are allowed.');
  });

  it('should stream uploaded video', async () => {
    const videoPath = join(__dirname, 'fixtures', 'Your_Blip_ChatBot.mp4');
    const videoStream = createReadStream(videoPath);
    
    await request(app.getHttpServer())
      .post('/upload/video')
      .attach('video', videoStream, {
        filename: 'Your_Blip_ChatBot.mp4',
        contentType: 'video/mp4'
      })
      .expect(204);

    const streamResponse = await request(app.getHttpServer())
      .get('/static/video/Your_Blip_ChatBot.mp4')
      .expect(200);

    expect(streamResponse.headers['content-type']).toBe('video/mp4');
    expect(streamResponse.headers['accept-ranges']).toBe('bytes');
  });

  describe('Error Handling', () => {
    it('should handle VideoNotFoundError', async () => {
      const response = await request(app.getHttpServer())
        .get('/static/video/non-existent-video.mp4')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body.message).toBe('Video not found');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle InvalidRangeError', async () => {
      const videoPath = join(__dirname, 'fixtures', 'Your_Blip_ChatBot.mp4');
      const videoStream = createReadStream(videoPath);
      
      await request(app.getHttpServer())
        .post('/upload/video')
        .attach('video', videoStream, {
          filename: 'Your_Blip_ChatBot.mp4',
          contentType: 'video/mp4'
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .get('/static/video/Your_Blip_ChatBot.mp4')
        .set('Range', 'bytes=invalid-range')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad Request');
      expect(response.body.message).toBe('Invalid range values');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle generic errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/upload')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle unknown exceptions', async () => {
      const response = await request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
