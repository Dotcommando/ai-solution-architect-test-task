import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface IErrorResponsePayload {
  details?: string;
  error: string;
  message: string | string[];
  path: string;
  statusCode: number;
}

interface IHttpExceptionResponseBody {
  error?: string;
  message?: string | string[];
  statusCode?: number;
}

@Catch()
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const statusCode = this.resolveStatusCode(exception);
    const payload = this.buildPayload(exception, request.url, statusCode);

    response.status(statusCode).json(payload);
  }

  private buildPayload(
    exception: unknown,
    path: string,
    statusCode: number,
  ): IErrorResponsePayload {
    if (exception instanceof HttpException) {
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        return {
          error: exception.name,
          message: responseBody,
          path,
          statusCode,
        };
      }

      if (this.isHttpExceptionResponseBody(responseBody)) {
        return {
          error: responseBody.error ?? exception.name,
          message: responseBody.message ?? exception.message,
          path,
          statusCode,
        };
      }
    }

    const message = exception instanceof Error
      ? exception.message
      : 'Internal server error';
    const details = exception instanceof Error
      ? this.extractCauseMessage(exception)
      : null;
    const payload: IErrorResponsePayload = {
      error: 'Internal Server Error',
      message,
      path,
      statusCode,
    };

    if (details !== null) {
      payload.details = details;
    }

    return payload;
  }

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractCauseMessage(
    error: Error,
    depth: number = 0,
  ): string | null {
    if (depth >= 5) {
      return null;
    }

    const cause = error.cause;

    if (!(cause instanceof Error)) {
      return null;
    }

    return this.extractCauseMessage(cause, depth + 1) ?? cause.message;
  }

  private isHttpExceptionResponseBody(
    value: unknown,
  ): value is IHttpExceptionResponseBody {
    return value !== null && typeof value === 'object';
  }
}
