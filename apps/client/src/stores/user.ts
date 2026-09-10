import { defineStore } from "pinia";
import { ref } from "vue";
import { getProfileApi, type UserProfile } from "../api/user";
import { STORAGE_KEYS } from "../constants";

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(localStorage.getItem(STORAGE_KEYS.TOKEN) || "");
  const profile = ref<UserProfile | null>(null);
  const loading = ref<boolean>(false);

  /** 设置并持久化用户 Token */
  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
  }

  /** 获取/刷新当前登录用户资料 */
  async function fetchProfile() {
    if (!token.value) return null;
    loading.value = true;
    try {
      const data = await getProfileApi();
      profile.value = data;
      return data;
    } finally {
      loading.value = false;
    }
  }

  /** 清除登录状态 */
  function logout() {
    token.value = "";
    profile.value = null;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  }

  return {
    token,
    profile,
    loading,
    setToken,
    fetchProfile,
    logout,
  };
});
