/** 本地存储 Key 常量 */
export const STORAGE_KEYS = {
  TOKEN: "earthworm_auth_token",
  USER_INFO: "earthworm_user_info",
  LOCALE: "earthworm_app_locale",
} as const;

/** 支持的多语言语言类型 */
export const LOCALES = {
  ZH_CN: "zh-CN",
  EN_US: "en-US",
} as const;

/** 路由名称常量 */
export const ROUTE_NAMES = {
  HOME: "Home",
  LOGIN: "Login",
  REGISTER: "Register",
} as const;

/** 路由路径常量 */
export const ROUTE_PATHS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;
