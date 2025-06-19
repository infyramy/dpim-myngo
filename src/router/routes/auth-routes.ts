import type { RouteRecordRaw } from "vue-router";

export const authRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/login.vue"),
    meta: {
      requiresAuth: false,
      layout: "auth",
      title: "Login",
    },
  },
  // Force a secondary login route to avoid potential caching issues
  {
    path: "/signin",
    redirect: "/login",
    meta: {
      requiresAuth: false,
      title: "Sign In",
    },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/pages/register.vue"),
    meta: {
      requiresAuth: false,
      layout: "blank",
      title: "Register",
    },
  },
  {
    path: "/register-form",
    name: "register-form",
    component: () => import("@/pages/register-form.vue"),
    meta: {
      requiresAuth: false,
      layout: "auth",
      title: "Registration Form",
    },
  },
  {
    path: "/register-success",
    name: "register-success",
    component: () => import("@/pages/register-success.vue"),
    meta: {
      requiresAuth: false,
      layout: "auth",
      title: "Registration Successful",
    },
  },
  {
    path: "/verify-otp",
    name: "verify-otp",
    component: () => import("@/pages/verify-otp.vue"),
    meta: {
      requiresAuth: false,
      layout: "auth",
      title: "Verify OTP",
    },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("@/pages/forgot-password.vue"),
    meta: {
      requiresAuth: false,
      layout: "auth",
      title: "Forgot Password",
    },
  },
];
