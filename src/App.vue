<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import DashboardLayout from "@/layouts/dashboard.vue";
import BlankLayout from "@/layouts/blank.vue";
import FormsLayout from "@/layouts/forms.vue";
import AuthLayout from "@/layouts/auth.vue";
import { Toaster } from "@/components/ui/sonner";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const layout = computed<"dashboard" | "blank" | "forms" | "auth">(() => {
  // Simplified layout logic for debugging
  const routeLayout = (route.meta.layout as "dashboard" | "blank" | "forms" | "auth") || "auth";
  console.log("Route:", route.path, "Layout:", routeLayout, "Auth:", authStore.isAuthenticated);
  return routeLayout;
});

onMounted(() => {
  console.log("App mounted with route:", route.path);
  console.log("Current layout:", layout.value);
  console.log("Authentication status:", authStore.isAuthenticated ? "Authenticated" : "Not authenticated");
});

watch(route, (newRoute) => {
  console.log("Route changed to:", newRoute.path);
  console.log("New layout:", route.meta.layout);
  
  // Check if user is trying to access a protected route
  if (newRoute.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log("User trying to access protected route without authentication");
  }
});

const layouts = {
  dashboard: DashboardLayout,
  blank: BlankLayout,
  forms: FormsLayout,
  auth: AuthLayout,
} as const;
</script>

<template>
  <Toaster position="top-right" />
  <component :is="layouts[layout]">
    <router-view v-slot="{ Component }">
      <!-- Temporarily disable transition to test if it's causing the issue -->
      <component :is="Component" />
    </router-view>
  </component>
</template>

<style>
/* Slide-in transition animation */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.2s ease-out;
}

.slide-in-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.slide-in-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
