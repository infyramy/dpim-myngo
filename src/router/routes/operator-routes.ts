import type { RouteRecordRaw } from "vue-router";

export const operatorRoutes: RouteRecordRaw[] = [
  {
    path: "/operator",
    redirect: "/operator/dashboard",
    meta: {
      requiresAuth: true,
      roles: ["operator"],
      layout: "dashboard",
    },
  },
  {
    path: "/operator/dashboard",
    name: "operator-dashboard",
    component: () => import("@/pages/operator/dashboard/index.vue"),
    meta: {
      requiresAuth: true,
      roles: ["operator"],
      layout: "dashboard",
    },
  },
  {
    path: "/operator/members",
    name: "operator-members",
    component: () => import("@/pages/operator/members/index.vue"),
    meta: {
      requiresAuth: true,
      roles: ["operator"],
      layout: "dashboard",
    },
  },
  {
    path: "/operator/applications",
    name: "operator-applications",
    component: () => import("@/pages/operator/applications/index.vue"),
    meta: {
      requiresAuth: true,
      roles: ["operator"],
      layout: "dashboard",
    },
  },
];
