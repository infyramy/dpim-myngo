import type { RouteRecordRaw } from "vue-router";

export const superadminRoutes: RouteRecordRaw[] = [
  {
    path: "/superadmin",
    redirect: "/superadmin/dashboard",
    meta: {
      requiresAuth: true,
      roles: ["superadmin"],
      layout: "dashboard",
    },
  },
  {
    path: "/superadmin/dashboard",
    name: "superadmin-dashboard",
    component: () => import("@/pages/superadmin/dashboard/index.vue"),
    meta: {
      requiresAuth: true,
      roles: ["superadmin"],
      layout: "dashboard",
      title: "Home",
    },
  },
  {
    path: "/superadmin/dashboard",
    redirect: "/superadmin/dashboard",
    meta: {
      requiresAuth: true,
      roles: ["superadmin"],
      layout: "dashboard",
    },
  },
  // Users & Roles Management
  {
    path: "/superadmin/users",
    name: "superadmin-users",
    component: () => import("@/pages/superadmin/users/index.vue"),
    meta: {
      requiresAuth: true,
      roles: ["superadmin"],
      layout: "dashboard",
      title: "Users Management",
    },
  },

  // Settings
  {
    path: "/superadmin/settings",
    name: "superadmin-settings",
    component: () => import("@/pages/superadmin/settings/index.vue"),
    meta: {
      requiresAuth: true,
      roles: ["superadmin"],
      layout: "dashboard",
      title: "Superadmin Settings",
    },
  },
];
