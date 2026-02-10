import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errForLog =
      exception instanceof Error
        ? {
            name: exception.name,
            message: exception.message,
            stack: exception.stack,
          }
        : { exception };

    this.logger.error(
      `${req.method} ${req.originalUrl} -> ${status}`,
      JSON.stringify(errForLog),
    );

    const clientMessage =
      status >= 500
        ? 'Internal server error'
        : isHttp
          ? exception.message
          : 'Error';

    res.status(status).json({
      statusCode: status,
      message: clientMessage,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
