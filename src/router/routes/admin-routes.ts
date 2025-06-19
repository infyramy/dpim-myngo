import type { RouteRecordRaw } from "vue-router";

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/admin",
    redirect: "/admin/dashboard",
    meta: {
      requiresAuth: true,
      roles: ["admin"],
      layout: "dashboard",
    },
  },
  {
    path: "/admin/dashboard",
    name: "admin-dashboard",
    component: () => import("@/pages/admin/dashboard/index.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
      title: "Dashboard",
      layout: "dashboard",
    },
  },
  {
    path: "/admin/states",
    name: "admin-states",
    component: () => import("@/pages/admin/states/index.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
      title: "States",
      layout: "dashboard",
    },
  },
];
