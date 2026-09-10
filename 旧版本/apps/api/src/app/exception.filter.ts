import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger("HttpExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // 记录完整的错误堆栈
    this.logger.error("Caught exception:", exception);
    if (exception instanceof Error) {
      this.logger.error("Error message:", exception.message);
      this.logger.error("Error stack:", exception.stack);

      // 如果是 AggregateError，输出所有子错误
      if (exception instanceof AggregateError) {
        this.logger.error("AggregateError details:");
        exception.errors.forEach((err, index) => {
          this.logger.error(`  Error ${index}:`, err);
        });
      }
    }

    let status = 500;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = exception.message ?? `${status >= 500 ? "Service Error" : "Client Error"}`;

      if (typeof exceptionResponse === "object" && exceptionResponse.hasOwnProperty("message")) {
        message = exceptionResponse["message"];
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      data: {},
      message,
    };

    response.status(status);
    response.header("Content-Type", "application/json; charset=utf-8");
    response.send(errorResponse);
  }
}
