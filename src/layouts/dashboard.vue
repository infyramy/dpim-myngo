<script setup lang="ts">
import { useNavigationStore } from "@/stores/navigation";
import { useNotificationStore } from "@/stores/notification";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColorMode } from "@vueuse/core";
import NavUser from "@/layouts/components/NavUser.vue";
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import KeyboardShortcutsDialog from "@/components/KeyboardShortcutsDialog.vue";
import {
  ChevronRight,
  Bell,
  Shield as ShieldIcon,
  Sun,
  Moon,
  User,
} from "lucide-vue-next";
import ImpersonationBanner from "@/components/ImpersonationBanner.vue";

// Pass { disableTransition: false } to enable transitions
const mode = ref(useColorMode());
const navigationStore = useNavigationStore();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const router = useRouter();
const showKeyboardShortcuts = ref(false);

// Initialize theme settings on mount
onMounted(() => {
  // Apply saved color scheme
  const savedColorScheme = localStorage.getItem("theme-color") || "green";
  document.documentElement.setAttribute("data-color-scheme", savedColorScheme);

  // Apply saved radius
  const savedRadius = localStorage.getItem("theme-radius") || "0.5";
  document.documentElement.style.setProperty("--radius", `${savedRadius}rem`);
});

// Use navigation from the store
const navigation = computed(() => navigationStore.navigation);

// Format time ago
function formatTimeAgo(timestamp: string | number | Date) {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Keyboard shortcut handler
function handleKeyDown(e: KeyboardEvent) {
  // Check if Cmd/Ctrl is pressed
  const isCmdOrCtrl = e.metaKey || e.ctrlKey;

  // Check for shortcuts
  if (isCmdOrCtrl && e.key === "k") {
    e.preventDefault();
    showKeyboardShortcuts.value = true;
  } else if (isCmdOrCtrl && e.key === "s") {
    e.preventDefault();
    router.push("/setting");
  } else if (e.shiftKey && e.key === "P") {
    e.preventDefault();
    router.push("/profile");
  }
}

function toggleMode() {
  mode.value = mode.value === "dark" ? "light" : "dark";
}

// Register and unregister keyboard event listeners
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader>
        <div class="flex items-center justify-center gap-2 mt-4">
          <img
            src="https://www.dpim.org.my/wp-content/uploads/2024/02/Logo-DPIM.png"
            alt="logo"
            class="h-20 w-auto bg-muted rounded-lg"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup v-for="group in navigation" :key="group.title">
          <SidebarGroupLabel>{{ group.title }}</SidebarGroupLabel>
          <SidebarMenu v-for="item in group.menu" :key="item.title">
            <Collapsible
              v-if="item.items"
              as-child
              :default-open="item.isActive"
              class="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton :tooltip="item.title">
                    <component
                      :is="item.icon"
                      v-if="item.icon"
                      class="text-primary"
                    />
                    <span>{{ item.title }}</span>
                    <ChevronRight
                      class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem
                      v-for="subItem in item.items"
                      :key="subItem.title"
                    >
                      <SidebarMenuSubButton as-child>
                        <a :href="subItem.url">
                          <span>{{ subItem.title }}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <SidebarMenuItem v-else>
              <SidebarMenuButton
                :tooltip="item.title"
                @click="router.push(item.url)"
              >
                <component
                  :is="item.icon"
                  v-if="item.icon"
                  class="text-primary"
                />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <!-- Role Section -->
        <div class="w-full" v-if="authStore.getUser()?.user_type">
          <div
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="{
              'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800':
                authStore.getUser()?.user_type === 'superadmin',
              'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800':
                authStore.getUser()?.user_type === 'admin',
              'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800':
                authStore.getUser()?.user_type === 'operator',
              'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800':
                authStore.getUser()?.user_type === 'user',
            }"
          >
            <div
              class="h-2 w-2 rounded-full"
              :class="{
                'bg-amber-500': authStore.getUser()?.user_type === 'superadmin',
                'bg-blue-500': authStore.getUser()?.user_type === 'admin',
                'bg-green-500': authStore.getUser()?.user_type === 'operator',
                'bg-gray-500': authStore.getUser()?.user_type === 'user',
              }"
            ></div>
            <User class="h-4 w-4" />
            <span
              class="capitalize"
              v-if="authStore.getUser()?.user_type != 'operator'"
              >{{ authStore.getUser()?.user_type }}</span
            >
            <span class="capitalize" v-else>State Admin</span>
            <div
              class="ml-auto"
              v-if="authStore.getUser()?.user_type != 'operator'"
            >
              <div
                class="text-xs px-1.5 py-0.5 rounded font-medium"
                :class="{
                  'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100':
                    authStore.getUser()?.user_type === 'superadmin',
                  'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100':
                    authStore.getUser()?.user_type === 'admin',
                  'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100':
                    authStore.getUser()?.user_type === 'operator',
                  'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100':
                    authStore.getUser()?.user_type === 'user',
                }"
              >
                {{
                  authStore.getUser()?.user_type === "superadmin"
                    ? "SUPER"
                    : authStore.getUser()?.user_type === "admin"
                    ? "ADMIN"
                    : authStore.getUser()?.user_type === "operator"
                    ? "OP"
                    : "USER"
                }}
              </div>
            </div>
            <div v-else class="ml-auto">
              <img
                :src="authStore.getOperatorStates()?.state_flag"
                alt=""
                class="h-4 w-4 rounded-full"
              />
            </div>
          </div>
        </div>

        <!-- User Section -->
        <div class="w-full">
          <NavUser />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <div class="flex flex-col flex-1">
        <ImpersonationBanner />
        <!-- Header with user controls -->
        <header
          class="bg-background/90 backdrop-blur-sm border-b p-3 flex items-center justify-between"
        >
          <div>
            <!-- Left side of header - can be used for breadcrumbs later -->
            <SidebarTrigger />
          </div>
          <div class="flex items-center gap-2">
            <!-- SuperAdmin Quick Access (only shown for superadmins) -->
            <Button
              v-if="authStore.user?.user_type === 'superadmin'"
              size="sm"
              class="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              @click="router.push('/superadmin/home')"
            >
              <ShieldIcon class="h-4 w-4" />
              <span class="hidden sm:inline">SuperAdmin</span>
            </Button>

            <Button
              class="flex-1 justify-center"
              variant="secondary"
              @click="toggleMode"
            >
              <Sun v-if="mode === 'dark'" class="h-4 w-4" />

              <Moon v-else class="h-4 w-4" />
            </Button>

            <!-- Notifications Button -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button size="sm" variant="ghost" class="relative">
                  <Bell class="h-4 w-4" />
                  <span
                    v-if="notificationStore.unreadCount > 0"
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                  >
                    {{ notificationStore.unreadCount }}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-80">
                <div class="p-3 border-b">
                  <div class="font-semibold">Notifications</div>
                  <div class="text-xs text-muted-foreground">
                    You have {{ notificationStore.unreadCount }} unread
                    notifications
                  </div>
                </div>

                <div class="max-h-96 overflow-y-auto">
                  <div
                    v-if="notificationStore.notifications.length === 0"
                    class="py-6 text-center"
                  >
                    <div
                      class="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2"
                    >
                      <Bell class="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div class="text-sm font-medium">No notifications</div>
                    <div class="text-xs text-muted-foreground mt-1">
                      You're all caught up!
                    </div>
                  </div>

                  <div
                    v-for="notification in notificationStore.notifications"
                    :key="notification.id"
                    class="p-3 border-b hover:bg-muted/50 transition-colors"
                    @click="notificationStore.markAsRead(notification.id)"
                  >
                    <div class="flex items-start gap-3">
                      <div
                        class="rounded-full p-1.5"
                        :class="{
                          'bg-blue-100 dark:bg-blue-900/30':
                            notification.type === 'info',
                          'bg-amber-100 dark:bg-amber-900/30':
                            notification.type === 'warning',
                          'bg-green-100 dark:bg-green-900/30':
                            notification.type === 'success',
                          'bg-red-100 dark:bg-red-900/30':
                            notification.type === 'error',
                        }"
                      >
                        <Bell
                          class="h-4 w-4"
                          :class="{
                            'text-blue-600 dark:text-blue-400':
                              notification.type === 'info',
                            'text-amber-600 dark:text-amber-400':
                              notification.type === 'warning',
                            'text-green-600 dark:text-green-400':
                              notification.type === 'success',
                            'text-red-600 dark:text-red-400':
                              notification.type === 'error',
                          }"
                        />
                      </div>
                      <div class="flex-1 space-y-1">
                        <div class="flex items-center justify-between gap-2">
                          <div class="font-medium text-sm">
                            {{ notification.title }}
                          </div>
                          <div class="text-xs text-muted-foreground">
                            {{ formatTimeAgo(notification.timestamp) }}
                          </div>
                        </div>
                        <div class="text-sm">
                          {{ notification.message }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-3 border-t">
                  <div class="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="router.push('/notifications')"
                    >
                      View All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="notificationStore.markAllAsRead()"
                      :disabled="notificationStore.unreadCount === 0"
                    >
                      Mark All Read
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
          <slot />
        </main>
      </div>
    </SidebarInset>
  </SidebarProvider>

  <!-- Keyboard Shortcuts Dialog -->
  <KeyboardShortcutsDialog v-model:open="showKeyboardShortcuts" />
</template>
