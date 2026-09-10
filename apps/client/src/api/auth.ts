import { apiClient } from "./client";

/** 注册参数类型声明 */
export interface RegisterParams {
  /** 登录用户名 */
  username: string;
  /** 登录密码 */
  password: string;
  /** 昵称 (选填) */
  nickname?: string;
  /** 邮箱 (选填) */
  email?: string;
}

/** 认证返回结果类型声明 */
export interface AuthResponse {
  /** 用户唯一主键 ID */
  userId: string;
  /** 用户名 */
  username: string;
  /** 用户昵称 */
  nickname: string;
  /** 邮箱 */
  email?: string;
  /** 认证 JWT Token */
  token: string;
}

/** 登录参数类型声明 */
export interface LoginParams {
  /** 登录用户名 */
  username: string;
  /** 登录密码 */
  password: string;
}

/**
 * 用户注册接口
 * @param params.username 用户名 (必填)
 * @param params.password 密码 (必填)
 * @param params.nickname 昵称 (选填)
 * @param params.email 邮箱 (选填)
 * @returns {Promise<AuthResponse>} 返回包含 userId, username, token 的注册结果
 */
export function registerApi(params: RegisterParams): Promise<AuthResponse> {
  return apiClient.post<any, AuthResponse>("/auth/register", params);
}

/**
 * 用户登录接口
 * @param params.username 用户名 (必填)
 * @param params.password 密码 (必填)
 * @returns {Promise<AuthResponse>} 返回包含 userId, username, token 的登录结果
 */
export function loginApi(params: LoginParams): Promise<AuthResponse> {
  return apiClient.post<any, AuthResponse>("/auth/login", params);
}
