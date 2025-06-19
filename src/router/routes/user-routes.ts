import type { RouteRecordRaw } from "vue-router";

export const userRoutes: RouteRecordRaw[] = [
  {
    path: "/user/dashboard",
    name: "user-dashboard",
    component: () => import("@/pages/user/dashboard/index.vue"),
    meta: {
      requiresAuth: true,
      layout: "dashboard",
      title: "Dashboard",
      roles: ["user"],
    },
  },
  {
    path: "/user/businesses",
    name: "user-business",
    component: () => import("@/pages/user/businesses/index.vue"),
    meta: {
      requiresAuth: true,
      layout: "dashboard",
      title: "Business",
      roles: ["user"],
    },
  },
  {
    path: "/user/businesses/add",
    name: "user-business-add",
    component: () => import("@/pages/user/businesses/add/index.vue"),
    meta: {
      requiresAuth: true,
      layout: "dashboard",
      title: "Add Business",
      roles: ["user"],
    },
  },
  {
    path: "/user/businesses/:id",
    name: "user-business-edit",
    component: () => import("@/pages/user/businesses/[id]/index.vue"),
    meta: {
      requiresAuth: true,
      layout: "dashboard",
      title: "Edit Business",
      roles: ["user"],
    },
  },
  {
    path: "/user/products",
    name: "user-products",
    component: () => import("@/pages/user/products/index.vue"),
    meta: {
      requiresAuth: true,
      layout: "dashboard",
      title: "Produk",
      roles: ["user"],
    },
  },
  {
    path: "/user/product-matching",
    name: "user-product-matching",
    component: () => import("@/pages/user/product-matching/index.vue"),
    meta: {
      requiresAuth: true,
      layout: "dashboard",
      title: "Padanan Produk",
      roles: ["user"],
    },
  },
];
