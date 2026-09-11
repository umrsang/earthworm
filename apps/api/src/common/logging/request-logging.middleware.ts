import { Injectable, type LoggerService, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

import { LOG_EVENTS, LOGGING_CONSTANTS } from "../constants";
import { FileLoggerService } from "./file-logger.service";
import { RequestContextService } from "./request-context.service";

export type RequestWithId = Request & { requestId: string };

/** 为请求生成追踪 ID，并记录请求开始、完成和耗时。 */
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger: LoggerService;

  constructor(fileLogger: FileLoggerService, private readonly requestContext: RequestContextService) {
    this.logger = fileLogger;
  }

  /**
   * @param request Express 请求对象，处理后包含 requestId
   * @param response Express 响应对象，响应头会携带 X-Request-Id
   * @param next Nest 中间件继续执行函数
   */
  use(request: RequestWithId, response: Response, next: NextFunction): void {
    const incomingRequestId = request.header(LOGGING_CONSTANTS.REQUEST_ID_HEADER)?.trim();
    const requestId = incomingRequestId || randomUUID();
    const startedAt = Date.now();

    request.requestId = requestId;
    response.setHeader(LOGGING_CONSTANTS.REQUEST_ID_RESPONSE_HEADER, requestId);
    this.requestContext.run(requestId, () => {
      this.logger.log({
        event: LOG_EVENTS.REQUEST_STARTED,
        method: request.method,
        path: request.originalUrl,
      }, RequestLoggingMiddleware.name);

      response.on("finish", () => {
        this.logger.log({
          event: LOG_EVENTS.REQUEST_COMPLETED,
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
        }, RequestLoggingMiddleware.name);
      });

      next();
    });
  }
}
