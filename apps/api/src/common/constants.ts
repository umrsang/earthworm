/** 数据库服务注入 Token */
export const DB_TOKEN = Symbol("DB_SERVICE_TOKEN");

/** 默认服务端监听端口 */
export const DEFAULT_PORT = 3001;

/** 日志与请求追踪配置常量 */
export const LOGGING_CONSTANTS = {
  DIRECTORY_NAME: "logs",
  FILE_PREFIX: "application",
  REQUEST_ID_HEADER: "x-request-id",
  REQUEST_ID_RESPONSE_HEADER: "X-Request-Id",
  UNKNOWN_CONTEXT: "Application",
} as const;

/** 结构化日志事件名称 */
export const LOG_EVENTS = {
  REQUEST_STARTED: "request.started",
  REQUEST_COMPLETED: "request.completed",
  REQUEST_FAILED: "request.failed",
  LOGIN_ATTEMPTED: "auth.login.attempted",
  LOGIN_SUCCEEDED: "auth.login.succeeded",
  LOGIN_FAILED: "auth.login.failed",
} as const;

/** 认证业务常量 */
export const AUTH_CONSTANTS = {
  DEFAULT_JWT_SECRET: "earthworm_jwt_secret_token_secure_key_2026",
  DEFAULT_JWT_EXPIRES_IN: "7d",
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 32,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 64,
} as const;

/** 业务错误提示常量 */
export const ERROR_MESSAGES = {
  USER_ALREADY_EXISTS: "用户名已存在，请更换后重试",
  USER_NOT_FOUND: "用户不存在",
  INVALID_CREDENTIALS: "用户名或密码错误",
  UNAUTHORIZED: "用户未登录或登录凭证已过期",
  INTERNAL_SERVER_ERROR: "服务器内部错误",
} as const;
