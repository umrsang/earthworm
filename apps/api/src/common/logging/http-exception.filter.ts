import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
  type LoggerService,
} from "@nestjs/common";
import type { Response } from "express";

import { ERROR_MESSAGES, LOG_EVENTS } from "../constants";
import { FileLoggerService } from "./file-logger.service";
import type { RequestWithId } from "./request-logging.middleware";

/** 捕获未处理异常，记录请求追踪信息并返回可关联的 requestId。 */
@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger: LoggerService;

  constructor(fileLogger: FileLoggerService) {
    this.logger = fileLogger;
  }

  /** @param exception 捕获到的异常 @param host Nest 请求上下文 */
  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const request = httpContext.getRequest<RequestWithId>();
    const response = httpContext.getResponse<Response>();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = this.resolveMessage(exceptionResponse, exception);

    this.logger.error({
      event: LOG_EVENTS.REQUEST_FAILED,
      requestId: request.requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode,
      message,
    }, exception instanceof Error ? exception.stack : undefined, GlobalHttpExceptionFilter.name);

    response.status(statusCode).json({
      statusCode,
      message,
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }

  /** 从 Nest 异常响应中提取对客户端安全的错误消息。 */
  private resolveMessage(exceptionResponse: string | object | undefined, exception: unknown): string | string[] {
    if (typeof exceptionResponse === "string") {
      return exceptionResponse;
    }
    if (exceptionResponse && "message" in exceptionResponse) {
      const message = (exceptionResponse as { message?: string | string[] }).message;
      if (message) return message;
    }
    return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  }
}
