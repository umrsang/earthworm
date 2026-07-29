import { useStorage } from "@vueuse/core";
import { navigateTo, useRuntimeConfig } from "nuxt/app";

let runtimeConfig: ReturnType<typeof useRuntimeConfig>;

export function setupAuth() {
  runtimeConfig = useRuntimeConfig();
}

const token = useStorage("earthworm_token", "");
const user = useStorage<Record<string, any> | null>("earthworm_user", null);

export function setToken(t: string) {
  token.value = t;
}

export function getToken() {
  return token.value;
}

export function setUser(u: Record<string, any>) {
  user.value = u;
}

export function getUser() {
  return user.value;
}

export function isAuthenticated() {
  return !!token.value;
}

export function signOut() {
  token.value = "";
  user.value = null;
  navigateTo("/");
}

export async function signIn(username: string, password: string) {
  const baseURL = runtimeConfig.public.apiBase as string;
  const response = await $fetch<{ token: string; userId: string; username: string }>(
    `${baseURL}/user/login`,
    {
      method: "POST",
      body: { username, password },
    },
  );

  setToken(response.token);
  return response;
}

export async function register(username: string, password: string) {
  const baseURL = runtimeConfig.public.apiBase as string;
  const response = await $fetch<{ token: string; userId: string; username: string }>(
    `${baseURL}/user/register`,
    {
      method: "POST",
      body: { username, password },
    },
  );

  setToken(response.token);
  return response;
}

export async function fetchUserInfo() {
  const baseURL = runtimeConfig.public.apiBase as string;
  const response = await $fetch(`${baseURL}/user`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response;
}

export function getSignInCallback() {
  let callback = sessionStorage.getItem("callback");
  if (callback) {
    sessionStorage.removeItem("callback");
    return callback;
  } else {
    return "/";
  }
}

export function setSignInCallback(callback: string) {
  sessionStorage.setItem("callback", callback);
}
