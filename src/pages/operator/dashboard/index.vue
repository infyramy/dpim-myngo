<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useMembers, type Member } from "@/composables/useMembers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Eye,
} from "lucide-vue-next";
import { apiFetching } from "@/services/api-fetching";
import { toast } from "vue-sonner";
import { useRouter } from "vue-router";

const router = useRouter();

const authStore = useAuthStore();

// Data refs
const dashboardStats = ref({
  totalMembers: 0,
  activeMembers: 0,
  pendingApplications: 0,
  totalProducts: 0,
  recentMembersCount: 0,
});

const recentApplications = ref<any[]>([]);
const recentMembers = ref<Member[]>([]);
const isLoadingStats = ref(false);
const isLoadingApplications = ref(false);
const isLoadingMembers = ref(false);

// Get operator state info
const operatorInfo = computed(() => {
  const user = authStore.getUser();
  const states = authStore.getOperatorStates();
  return {
    name: user?.fullname || "Operator",
    stateName: states?.state_name || "Your State",
  };
});

// Computed for loading state
const isLoading = computed(
  () =>
    isLoadingStats.value ||
    isLoadingApplications.value ||
    isLoadingMembers.value
);

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "suspended":
      return "destructive";
    default:
      return "secondary";
  }
};

// Fetch dashboard overview (all data in one optimized call)
const fetchDashboardOverview = async () => {
  try {
    isLoadingStats.value = true;
    isLoadingApplications.value = true;
    isLoadingMembers.value = true;

    const response = await apiFetching().get(
      "/operator-dashboard/overview",
      true
    );
    const data = response.data;

    // Update dashboard stats
    dashboardStats.value = {
      totalMembers: data.stats.totalMembers,
      activeMembers: data.stats.activeMembers,
      pendingApplications: data.stats.pendingApplications,
      totalProducts: data.stats.totalProducts,
      recentMembersCount: data.stats.recentMembersCount,
    };

    // Update recent data
    recentApplications.value = data.recentApplications || [];
    recentMembers.value = data.recentMembers || [];
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    toast.error("Failed to load dashboard data");
  } finally {
    isLoadingStats.value = false;
    isLoadingApplications.value = false;
    isLoadingMembers.value = false;
  }
};

// Individual fetch functions for specific updates
const fetchDashboardStats = async () => {
  try {
    isLoadingStats.value = true;
    const response = await apiFetching().get("/operator-dashboard/stats", true);
    dashboardStats.value = {
      totalMembers: response.data.stats.totalMembers,
      activeMembers: response.data.stats.activeMembers,
      pendingApplications: response.data.stats.pendingApplications,
      totalProducts: response.data.stats.totalProducts,
      recentMembersCount: response.data.stats.recentMembersCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    toast.error("Failed to load dashboard statistics");
  } finally {
    isLoadingStats.value = false;
  }
};

const fetchRecentApplications = async () => {
  try {
    isLoadingApplications.value = true;
    const response = await apiFetching().get(
      "/operator-dashboard/recent-applications",
      true
    );
    recentApplications.value = response.data.applications || [];
  } catch (error) {
    console.error("Error fetching applications:", error);
    toast.error("Failed to load recent applications");
  } finally {
    isLoadingApplications.value = false;
  }
};

const fetchRecentMembers = async () => {
  try {
    isLoadingMembers.value = true;
    const response = await apiFetching().get(
      "/operator-dashboard/recent-members",
      true
    );
    recentMembers.value = response.data.members || [];
  } catch (error) {
    console.error("Error fetching members:", error);
    toast.error("Failed to load recent members");
  } finally {
    isLoadingMembers.value = false;
  }
};

// Quick action handlers
const handleQuickApprove = async (applicationId: string) => {
  try {
    await apiFetching().post(
      "/applications/approve",
      { id: applicationId },
      true
    );
    toast.success("Application approved successfully");
    // Refresh dashboard data after approval to get updated counts
    await fetchDashboardOverview();
  } catch (error) {
    console.error("Error approving application:", error);
    toast.error("Failed to approve application");
  }
};

// Refresh all data using the optimized overview endpoint
const refreshDashboard = async () => {
  await fetchDashboardOverview();
  toast.success("Dashboard refreshed");
};

// Initialize dashboard
onMounted(async () => {
  await fetchDashboardOverview();
});
</script>

<template>
  <div class="flex flex-col gap-6 md:gap-8">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold md:text-3xl">
          {{ authStore.getOperatorStates()?.state_title }} Dashboard
        </h1>
        <p class="text-muted-foreground">
          Welcome back, {{ operatorInfo.name }}. Here's what's happening in your
          region.
        </p>
      </div>
      <Button
        variant="outline"
        @click="refreshDashboard"
        :disabled="isLoading"
        class="w-full md:w-auto"
      >
        <TrendingUp class="mr-2 h-4 w-4" />
        Refresh Data
      </Button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- Total Members -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Total Members</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div v-if="isLoadingStats" class="space-y-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-24" />
          </div>
          <div v-else>
            <div class="text-2xl font-bold">
              {{ dashboardStats.totalMembers }}
            </div>
            <p class="text-xs text-muted-foreground">
              {{ dashboardStats.activeMembers }} active members
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Pending Applications -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium"
            >Pending Applications</CardTitle
          >
          <AlertCircle class="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div v-if="isLoadingStats" class="space-y-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-32" />
          </div>
          <div v-else>
            <div class="text-2xl font-bold text-amber-600">
              {{ dashboardStats.pendingApplications }}
            </div>
            <p class="text-xs text-muted-foreground">Awaiting your review</p>
          </div>
        </CardContent>
      </Card>

      <!-- Total Products -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Products Registered</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div v-if="isLoadingStats" class="space-y-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-36" />
          </div>
          <div v-else>
            <div class="text-2xl font-bold">
              {{ dashboardStats.totalProducts }}
            </div>
            <p class="text-xs text-muted-foreground">From all active members</p>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Activity -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Recent Activity</CardTitle>
          <CalendarDays class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div v-if="isLoadingStats" class="space-y-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-28" />
          </div>
          <div v-else>
            <div class="text-2xl font-bold">
              {{ dashboardStats.recentMembersCount }}
            </div>
            <p class="text-xs text-muted-foreground">New members this week</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Recent Applications -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            to="/operator/applications"
            class="text-sm"
          >
            <Eye class="mr-1 h-4 w-4" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div v-if="isLoadingApplications" class="space-y-4">
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-center justify-between p-4 border rounded-lg"
            >
              <div class="space-y-2">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-48" />
              </div>
              <Skeleton class="h-8 w-20" />
            </div>
          </div>

          <div
            v-else-if="recentApplications.length === 0"
            class="text-center py-8"
          >
            <AlertCircle class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p class="text-muted-foreground">No pending applications</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="application in recentApplications"
              :key="application.id"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div class="space-y-1">
                <p class="font-medium">{{ application.fullname }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ application.email }}
                </p>
                <p class="text-xs text-muted-foreground">
                  Applied {{ formatDate(application.apply_at) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Badge :variant="getStatusVariant(application.status)">
                  {{ application.status }}
                </Badge>
                <Button
                  size="sm"
                  @click="handleQuickApprove(application.id)"
                  v-if="application.status === 'pending'"
                >
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Members -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Recent Members</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            to="/operator/members"
            class="text-sm"
          >
            <Eye class="mr-1 h-4 w-4" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div v-if="isLoadingMembers" class="space-y-4">
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-center justify-between p-4 border rounded-lg"
            >
              <div class="space-y-2">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-48" />
                <Skeleton class="h-3 w-24" />
              </div>
              <Skeleton class="h-6 w-16" />
            </div>
          </div>

          <div v-else-if="recentMembers.length === 0" class="text-center py-8">
            <Users class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p class="text-muted-foreground">No members found</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="member in recentMembers"
              :key="member.id"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div class="space-y-1">
                <p class="font-medium">{{ member.name }}</p>
                <p class="text-sm text-muted-foreground">{{ member.email }}</p>
                <div
                  class="flex items-center gap-4 text-xs text-muted-foreground"
                >
                  <span>{{ member.businessesCount || 0 }} businesses</span>
                  <span>{{ member.productsCount || 0 }} products</span>
                </div>
              </div>
              <Badge :variant="getStatusVariant(member.status)">
                {{ member.status }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-3">
          <Button
            variant="outline"
            class="justify-start h-auto p-6"
            @click="router.push('/operator/applications')"
          >
            <div class="flex flex-col items-start gap-2">
              <AlertCircle class="h-5 w-5 text-amber-500" />
              <div>
                <p class="font-medium">Review Applications</p>
                <p class="text-sm text-muted-foreground">
                  {{ dashboardStats.pendingApplications }} pending
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            class="justify-start h-auto p-6"
            @click="router.push('/operator/members')"
          >
            <div class="flex flex-col items-start gap-2">
              <Users class="h-5 w-5 text-blue-500" />
              <div>
                <p class="font-medium">Manage Members</p>
                <p class="text-sm text-muted-foreground">
                  {{ dashboardStats.totalMembers }} total members
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            class="justify-start h-auto p-6"
            @click="refreshDashboard"
            :disabled="isLoading"
          >
            <div class="flex flex-col items-start gap-2">
              <TrendingUp class="h-5 w-5 text-green-500" />
              <div>
                <p class="font-medium">Refresh Data</p>
                <p class="text-sm text-muted-foreground">Update dashboard</p>
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
