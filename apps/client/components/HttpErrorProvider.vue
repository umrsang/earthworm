<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner";

import { injectHttpStatusErrorHandler } from "~/api/http.js";
import { setSignInCallback } from "~/services/auth";

useHttpStatusError();

function useHttpStatusError() {
  injectHttpStatusErrorHandler(async (errMessage, statusCode) => {
    switch (statusCode) {
      case 401:
        toast.error(errMessage, {
          duration: 2000,
          onAutoClose() {
            setSignInCallback(window.location.pathname);
            navigateTo("/callback");
          },
        });
        break;
      default:
        toast.error(errMessage);
        break;
    }
  });
}
</script>

<style scoped></style>
~/store/user
