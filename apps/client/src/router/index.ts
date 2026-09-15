import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { ROUTE_NAMES, ROUTE_PATHS, STORAGE_KEYS } from "../constants";
import CoursePackDetailView from "../views/CoursePackDetailView.vue";
import CoursePacksView from "../views/CoursePacksView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import SentenceGameView from "../views/SentenceGameView.vue";

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
    path: ROUTE_PATHS.COURSE_PACKS,
    name: ROUTE_NAMES.COURSE_PACKS,
    component: CoursePacksView,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTE_PATHS.COURSE_PACK_UPLOAD,
    name: ROUTE_NAMES.COURSE_PACK_UPLOAD,
    // 上传页依赖 ZIP 解析器，且仅管理员可访问
    component: () => import("../views/CoursePackUploadView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: ROUTE_PATHS.COURSE_PACK_DETAIL,
    name: ROUTE_NAMES.COURSE_PACK_DETAIL,
    component: CoursePackDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTE_PATHS.COURSE_GAME,
    name: ROUTE_NAMES.COURSE_GAME,
    component: SentenceGameView,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTE_PATHS.ADMIN,
    name: ROUTE_NAMES.ADMIN,
    component: () => import("../views/AdminView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: ROUTE_PATHS.PROFILE,
    name: ROUTE_NAMES.PROFILE,
    component: () => import("../views/ProfileView.vue"),
    meta: { requiresAuth: true },
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
  // 课程学习与创作数据属于用户私有内容，访问前必须完成登录。
  if (to.meta.requiresAuth && !token) {
    next({ path: ROUTE_PATHS.LOGIN, query: { redirect: to.fullPath } });
    return;
  }
  // 已登录用户无需重复访问登录页
  if ((to.path === ROUTE_PATHS.LOGIN || to.path === ROUTE_PATHS.REGISTER) && token) {
    next({ path: ROUTE_PATHS.HOME });
    return;
  }
  // 严格管理员权限拦截：系统设置与课程包上传仅对管理员开放
  if (to.meta.requiresAdmin) {
    const rawUser = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    let role = "";
    try {
      role = rawUser ? JSON.parse(rawUser)?.role : "";
    } catch {
      role = "";
    }
    if (role !== "admin") {
      next({ path: ROUTE_PATHS.PROFILE });
      return;
    }
  }
  next();
});
