import axios from "axios";
import { STORAGE_KEYS } from "../constants";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器：自动在 Authorization 中注入 Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一数据解包与异常处理
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 捕获 401 未登录异常
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    }
    const message = error.response?.data?.message || error.message || "请求失败";
    return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
  },
);
