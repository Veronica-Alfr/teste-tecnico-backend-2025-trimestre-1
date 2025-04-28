import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, PayloadTooLargeException } from '@nestjs/common';
import { MulterError } from 'multer';
import { Response } from 'express';

@Catch(MulterError, PayloadTooLargeException)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError | PayloadTooLargeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Upload error.';

    if (
      (exception instanceof MulterError && exception.code === 'LIMIT_FILE_SIZE') ||
      exception instanceof PayloadTooLargeException
    ) {
      message = 'File too large. Max size is 10MB.';
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
