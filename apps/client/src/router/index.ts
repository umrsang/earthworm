import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { ROUTE_NAMES, ROUTE_PATHS, STORAGE_KEYS } from "../constants";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.HOME,
    name: ROUTE_NAMES.HOME,
    component: HomeView,
  },
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: LoginView,
  },
  {
    path: ROUTE_PATHS.REGISTER,
    name: ROUTE_NAMES.REGISTER,
    // 登录与注册统一使用复刻旧版的沉浸式双栏组件
    component: LoginView,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: ROUTE_PATHS.HOME,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局路由拦截守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  // 已登录用户无需重复访问登录页
  if ((to.path === ROUTE_PATHS.LOGIN || to.path === ROUTE_PATHS.REGISTER) && token) {
    next({ path: ROUTE_PATHS.HOME });
  } else {
    next();
  }
});
