import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { routes } from "./routes/index";
import type { UserRole } from "@/types/auth";
import { prefetchRouteComponents } from "@/composables/useAsyncComponent";

// Define common component loaders for prefetching
const commonComponentLoaders = {
  dashboard: () => import("@/layouts/dashboard.vue"),
  admin: () => import("@/pages/admin/dashboard/index.vue"),
  operator: () => import("@/pages/operator/dashboard/index.vue"),
  user: () => import("@/pages/user/dashboard/index.vue"),
  profile: () => import("@/pages/profile/index.vue"),
  settings: () => import("@/pages/setting/index.vue"),
};

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// Navigation guard for authentication and role-based access
router.beforeEach(async (to, from, next) => {
  // Set document title based on route metadata
  const defaultTitle = "myNGO";
  document.title = to.meta.title
    ? `${to.meta.title} | ${defaultTitle}`
    : defaultTitle;

  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;
  const allowedRoles = to.meta.roles as string[] | undefined;

  console.log("Route access:", {
    path: to.path,
    requiresAuth,
    isAuthenticated: authStore.getUser()?.isAuthenticated || false,
    userRole: authStore.getUser()?.user_type || "none",
  });

  // Special case for home route (/) - redirect to login if not authenticated
  if (to.path === "/" && to.name === "home") {
    if (!authStore.getUser()?.isAuthenticated) {
      console.log("Redirecting from home to login (not authenticated)");
      return next("/login");
    } else {
      // If authenticated, redirect to appropriate dashboard based on role
      const userType = authStore.getUser()?.user_type as UserRole;
      let dashboardPath = getDashboardPathByRole(userType);
      console.log(
        `Redirecting from home to ${dashboardPath} (authenticated as ${userType})`
      );
      return next(dashboardPath);
    }
  }

  // Handle public routes
  if (!requiresAuth) {
    // If user is authenticated and tries to access login/register, redirect to their dashboard
    if (
      authStore.getUser()?.isAuthenticated &&
      (to.name === "login" || to.name === "register")
    ) {
      const userType = authStore.getUser()?.user_type as UserRole;
      const dashboardPath = getDashboardPathByRole(userType);

      // Prevent redirect loop by checking if we're already going to the dashboard
      if (to.path === dashboardPath) {
        return next();
      }

      console.log(
        `Redirecting authenticated user from ${to.name} to: ${dashboardPath}`
      );
      return next(dashboardPath);
    }
    return next();
  }

  // Handle protected routes
  if (!authStore.getUser()?.isAuthenticated) {
    console.log(
      "Unauthenticated user trying to access protected route:",
      to.path
    );

    // Prevent redirect loop by checking if we're already going to login
    if (to.name === "login") {
      return next();
    }

    // Save the intended destination
    return next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  }

  // Check role-based access
  if (allowedRoles && authStore.getUser()) {
    if (!allowedRoles.includes(authStore.getUser()?.user_type)) {
      console.log(
        `User role ${
          authStore.getUser()?.user_type
        } not authorized for route: ${to.path}`
      );

      // Redirect to appropriate dashboard instead of 404
      const userType = authStore.getUser()?.user_type as UserRole;
      const dashboardPath = getDashboardPathByRole(userType);
      console.log(`Redirecting to ${dashboardPath}`);
      return next(dashboardPath);
    }
  }

  // Proceed to route
  return next();
});

// After each route change, prefetch components for likely next navigations
router.afterEach((to) => {
  // Prefetch components based on current route
  prefetchRouteComponents(to.path, commonComponentLoaders);

  // Prefetch specific role-based components if authenticated
  const authStore = useAuthStore();
  if (authStore.getUser()?.isAuthenticated && authStore.getUser()) {
    const userType = authStore.getUser()?.user_type as UserRole;

    // Specific role-based prefetching
    switch (userType) {
      case "admin":
        prefetchRouteComponents(to.path, {
          dashboard: () => import("@/pages/admin/dashboard/index.vue"),
          states: () => import("@/pages/admin/states/index.vue"),
        });
        break;
      case "user":
        prefetchRouteComponents(to.path, {
          dashboard: () => import("@/pages/user/dashboard/index.vue"),
          profile: () => import("@/pages/profile/index.vue"),
          settings: () => import("@/pages/setting/index.vue"),
        });
        break;
      // Add other roles as needed
    }
  }
});

// Helper function to get dashboard path by role
function getDashboardPathByRole(role: UserRole): string {
  switch (role) {
    case "superadmin":
      return "/superadmin/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "operator":
      return "/operator/dashboard";
    case "user":
      return "/user/dashboard";
    default:
      return "/login";
  }
}

export default router;
