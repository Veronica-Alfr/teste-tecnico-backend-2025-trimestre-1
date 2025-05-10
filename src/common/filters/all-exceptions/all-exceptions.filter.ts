import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  InvalidRangeError,
  VideoNotFoundError,
} from '../../../custom/error/errors';
import { IExceptionResponse } from '../../../interfaces/IExceptionResponse';

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
        const response = exceptionResponse as IExceptionResponse;
        message = response.message || exception.message;
        errorType = response.error || exception.name;
      } else {
        message = exceptionResponse;
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
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      error: errorType,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
