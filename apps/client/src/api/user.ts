import { apiClient } from "./client";

/** 用户个人资料类型声明 */
export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  email: string | null;
  avatar: string | null;
  role: "user" | "admin";
  createdAt: string | number;
  updatedAt: string | number;
}

/**
 * 获取当前登录用户个人资料
 * @returns {Promise<UserProfile>} 返回用户个人资料详情（包含 id, username, nickname 等）
 */
export function getProfileApi(): Promise<UserProfile> {
  return apiClient.get<any, UserProfile>("/user/profile");
}
