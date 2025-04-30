import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { InvalidRangeError, VideoNotFoundError } from 'src/custom/error/errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorType = 'Unknown Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as Record<string, any>).message || exception.message;
        errorType = (exceptionResponse as Record<string, any>).error || exception.name;
      } else {
        message = exceptionResponse as string;
        errorType = exception.name;
      }
    } else if (exception instanceof VideoNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
      errorType = 'Not Found';
    } else if (exception instanceof InvalidRangeError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorType = 'Bad Request';
    } else if (exception instanceof Error) {
      message = exception.message;
      errorType = exception.name;
    }

    this.logger.error(
      `Exception: ${JSON.stringify({ errorType, message })}, Status: ${status}`,
      exception instanceof Error ? exception.stack : ''
    );

    response.status(status).json({
      statusCode: status,
      error: errorType,
      message,
      timestamp: new Date().toISOString(),
    });
  };
};
