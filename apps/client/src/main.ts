import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import { i18n } from "./locales";
import { router } from "./router";
import "./styles/main.css";
import "./styles/landing.css";
import "./styles/course.css";
import "./styles/game.css";
import "./styles/admin.css";
import "./styles/profile.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

app.mount("#app");
