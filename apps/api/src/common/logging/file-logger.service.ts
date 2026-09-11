import { Injectable, type LoggerService } from "@nestjs/common";
import { appendFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { LOGGING_CONSTANTS } from "../constants";
import { RequestContextService } from "./request-context.service";

type LogLevel = "debug" | "error" | "fatal" | "log" | "verbose" | "warn";

interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: unknown;
  requestId?: string;
  trace?: string;
}

/**
 * 将 Nest 日志同时写入控制台和按日期分割的 JSONL 文件。
 * 单行 JSON 格式便于后续按 requestId 检索完整调用链。
 */
@Injectable()
export class FileLoggerService implements LoggerService {
  private readonly logDirectory = resolve(process.cwd(), LOGGING_CONSTANTS.DIRECTORY_NAME);

  constructor(private readonly requestContext: RequestContextService) {}

  log(message: unknown, context?: string): void {
    this.write("log", message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write("error", message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write("warn", message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write("debug", message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write("verbose", message, context);
  }

  fatal(message: unknown, context?: string): void {
    this.write("fatal", message, context);
  }

  /**
   * 写入结构化日志；文件异常只回退到控制台，避免日志故障阻断业务请求。
   * @param level 日志级别
   * @param message 日志消息或结构化业务数据
   * @param context Nest 日志上下文
   * @param trace 异常堆栈
   */
  private write(level: LogLevel, message: unknown, context?: string, trace?: string): void {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || LOGGING_CONSTANTS.UNKNOWN_CONTEXT,
      message,
      ...(this.requestContext.getRequestId() ? { requestId: this.requestContext.getRequestId() } : {}),
      ...(trace ? { trace } : {}),
    };
    const serializedEntry = JSON.stringify(entry);

    this.writeConsole(level, serializedEntry);

    try {
      mkdirSync(this.logDirectory, { recursive: true });
      const date = entry.timestamp.slice(0, 10);
      const filePath = join(this.logDirectory, `${LOGGING_CONSTANTS.FILE_PREFIX}-${date}.log`);
      appendFileSync(filePath, `${serializedEntry}\n`, "utf8");
    } catch (error) {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        context: FileLoggerService.name,
        message: error instanceof Error ? error.message : String(error),
      }));
    }
  }

  /** 根据日志级别选择对应的控制台输出方法。 */
  private writeConsole(level: LogLevel, serializedEntry: string): void {
    if (level === "error" || level === "fatal") {
      console.error(serializedEntry);
      return;
    }
    if (level === "warn") {
      console.warn(serializedEntry);
      return;
    }
    console.log(serializedEntry);
  }
}
