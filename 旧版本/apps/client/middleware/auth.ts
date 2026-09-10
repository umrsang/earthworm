import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

import { isAuthenticated, setSignInCallback } from "~/services/auth";

export default defineNuxtRouteMiddleware((to) => {
  if (!isAuthenticated()) {
    setSignInCallback(to.fullPath);
    return navigateTo("/callback");
  }
});
