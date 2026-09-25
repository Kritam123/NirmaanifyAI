import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '@nirmaanify/types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = typeof res === 'string' ? res : res.message || message;
      errors = typeof res === 'object' && res.errors ? res.errors : undefined;
    } else if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    ) {
      const prismaErr = exception as { code: string; meta?: any; message?: string };
      if (prismaErr.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        const target = Array.isArray(prismaErr.meta?.target)
          ? prismaErr.meta.target.join(', ')
          : prismaErr.meta?.target || 'field';
        message = `Unique constraint failed: A record with this ${target} already exists`;
      } else if (prismaErr.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Requested record was not found';
      } else if (prismaErr.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint violation';
      } else {
        message = 'A database operation error occurred';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(`[${request.method}] ${request.url} - Status ${status} - ${message}`);

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
