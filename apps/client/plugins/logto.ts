import { defineNuxtPlugin } from "nuxt/app";

import { setupAuth } from "~/services/auth";

export default defineNuxtPlugin(() => {
  setupAuth();
});
