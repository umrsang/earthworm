import { Global, MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";

import { FileLoggerService } from "./file-logger.service";
import { RequestLoggingMiddleware } from "./request-logging.middleware";
import { RequestContextService } from "./request-context.service";

/** 提供全局文件日志和请求追踪中间件。 */
@Global()
@Module({
  providers: [RequestContextService, FileLoggerService, RequestLoggingMiddleware],
  exports: [FileLoggerService, RequestContextService],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes("*");
  }
}
