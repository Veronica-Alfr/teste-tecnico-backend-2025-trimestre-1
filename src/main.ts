import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './common/filters/http-error/http-error.filter';
import { MulterExceptionFilter } from './common/filters/multer-exception/multer-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(
    new HttpErrorFilter(), 
    new MulterExceptionFilter()
  );

  await app.listen(3001);
}

bootstrap();