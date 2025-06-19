<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const authStore = useAuthStore();
const username = ref(authStore.user?.fullname || "Admin");

// Mock data for prototype
const stateData = ref([
  { name: "Selangor", members: 234, pendingApplications: 5, products: 568 },
  { name: "Kuala Lumpur", members: 187, pendingApplications: 2, products: 412 },
  { name: "Johor", members: 156, pendingApplications: 8, products: 289 },
  { name: "Pulau Pinang", members: 119, pendingApplications: 1, products: 254 },
  { name: "Sabah", members: 92, pendingApplications: 3, products: 175 },
]);

const totalMembers = ref(0);
const totalProducts = ref(0);
const totalPendingApplications = ref(0);

onMounted(() => {
  calculateTotals();
});

function calculateTotals() {
  totalMembers.value = stateData.value.reduce(
    (sum, state) => sum + state.members,
    0
  );
  totalProducts.value = stateData.value.reduce(
    (sum, state) => sum + state.products,
    0
  );
  totalPendingApplications.value = stateData.value.reduce(
    (sum, state) => sum + state.pendingApplications,
    0
  );
}
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-8">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold md:text-2xl">HQ Admin Dashboard</h1>
      <Button variant="outline">Refresh Data</Button>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Total Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalMembers }}</div>
          <p class="text-xs text-muted-foreground">Across all state branches</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Products Registered</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalProducts }}</div>
          <p class="text-xs text-muted-foreground">Across all state branches</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium"
            >Pending Applications</CardTitle
          >
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalPendingApplications }}</div>
          <p class="text-xs text-muted-foreground">
            Awaiting state admin approval
          </p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>State Branch Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead>
              <tr class="border-b">
                <th class="h-10 px-4 text-left font-medium">State</th>
                <th class="h-10 px-4 text-right font-medium">Members</th>
                <th class="h-10 px-4 text-right font-medium">
                  Pending Applications
                </th>
                <th class="h-10 px-4 text-right font-medium">Products</th>
                <th class="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="state in stateData" :key="state.name" class="border-b">
                <td class="p-4 align-middle font-medium">{{ state.name }}</td>
                <td class="p-4 align-middle text-right">{{ state.members }}</td>
                <td class="p-4 align-middle text-right">
                  <span
                    :class="
                      state.pendingApplications > 0
                        ? 'text-amber-600 font-medium'
                        : ''
                    "
                  >
                    {{ state.pendingApplications }}
                  </span>
                </td>
                <td class="p-4 align-middle text-right">
                  {{ state.products }}
                </td>
                <td class="p-4 align-middle text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
