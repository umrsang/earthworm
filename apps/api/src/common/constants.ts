/** 数据库服务注入 Token */
export const DB_TOKEN = Symbol("DB_SERVICE_TOKEN");

/** 默认服务端监听端口 */
export const DEFAULT_PORT = 3001;

/** 认证业务常量 */
export const AUTH_CONSTANTS = {
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
} as const;
