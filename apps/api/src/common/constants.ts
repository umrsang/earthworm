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

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const AI_CONSTANTS = {
  DEFAULT_BASE_URL: "https://api.openai.com/v1",
  REQUEST_TIMEOUT_MS: 120000,
  MAX_STATEMENT_REGENERATIONS: 3,
  API_KEY_MASK_PREFIX_LENGTH: 3,
  API_KEY_MASK_SUFFIX_LENGTH: 4,
  API_KEY_MASK: "••••••••",
} as const;

/** 业务错误提示常量 */
export const ERROR_MESSAGES = {
  USER_ALREADY_EXISTS: "用户名已存在，请更换后重试",
  USER_NOT_FOUND: "用户不存在",
  INVALID_CREDENTIALS: "用户名或密码错误",
  UNAUTHORIZED: "用户未登录或登录凭证已过期",
  COURSE_PACK_TOO_LARGE: "单个课程包最多包含 10000 句",
  COURSE_PACK_METADATA_INVALID: "课程包元数据格式不正确",
  COURSE_ANNOTATION_INVALID: "课程句子标注格式或索引不正确",
  COURSE_PACK_NOT_FOUND: "课程包不存在或无权访问",
  COURSE_NOT_FOUND: "课程不存在或无权访问",
  COURSE_PROGRESS_OUT_OF_RANGE: "学习进度超出课程句子范围",
  LEARNING_ACTIVITY_INVALID: "学习活动事件数据不正确",
  ADMIN_REQUIRED: "仅管理员可以执行此操作",
  AI_MODEL_NOT_FOUND: "大模型配置不存在",
  AI_MODEL_REQUIRED: "请先在管理端配置并启用一个大模型",
  AI_MODEL_REQUEST_FAILED: "大模型分析请求失败",
  AI_MODEL_RESPONSE_INVALID: "大模型返回的数据格式不正确",
  AI_MODEL_API_KEY_REQUIRED: "新增模型时必须填写 API Key",
  AI_REGENERATION_LIMIT_REACHED: "当前句子的重新生成次数已用完",
  INTERNAL_SERVER_ERROR: "服务器内部错误",
} as const;
