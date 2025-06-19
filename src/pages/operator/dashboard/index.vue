<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const authStore = useAuthStore();
const stateName = ref("Selangor"); // In a real app, this would come from the admin's profile

// Mock data for prototype
const memberData = ref([
  {
    id: "1",
    name: "Ahmad Bin Hassan",
    companyName: "Syarikat A Sdn Bhd",
    joinDate: "2023-10-15",
    productsCount: 5,
  },
  {
    id: "2",
    name: "Siti Binti Zulkifli",
    companyName: "Syarikat B Enterprise",
    joinDate: "2023-11-02",
    productsCount: 3,
  },
  {
    id: "3",
    name: "Kamal Bin Razali",
    companyName: "Syarikat C Trading",
    joinDate: "2023-11-18",
    productsCount: 8,
  },
  {
    id: "4",
    name: "Nurul Binti Aziz",
    companyName: "Syarikat D Bhd",
    joinDate: "2023-12-05",
    productsCount: 2,
  },
  {
    id: "5",
    name: "Ismail Bin Kassim",
    companyName: "Syarikat E Resources",
    joinDate: "2024-01-10",
    productsCount: 6,
  },
]);

const applicationsData = ref([
  {
    id: "APP001",
    name: "Mahmud Bin Abdul",
    email: "mahmud@example.com",
    applyDate: "2024-02-15",
    status: "pending",
  },
  {
    id: "APP002",
    name: "Fatimah Binti Omar",
    email: "fatimah@example.com",
    applyDate: "2024-02-16",
    status: "pending",
  },
  {
    id: "APP003",
    name: "Rizal Bin Najib",
    email: "rizal@example.com",
    applyDate: "2024-02-17",
    status: "pending",
  },
]);

const totalMembers = ref(memberData.value.length);
const totalProducts = ref(
  memberData.value.reduce((sum, member) => sum + member.productsCount, 0)
);
const pendingApplications = ref(applicationsData.value.length);
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-8">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold md:text-2xl">
        {{ stateName }} Admin Dashboard
      </h1>
      <Button variant="outline">Refresh Data</Button>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Total Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalMembers }}</div>
          <p class="text-xs text-muted-foreground">
            Active members in {{ stateName }}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Products Registered</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalProducts }}</div>
          <p class="text-xs text-muted-foreground">
            From all members in {{ stateName }}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium"
            >Pending Applications</CardTitle
          >
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ pendingApplications }}</div>
          <p class="text-xs text-muted-foreground">Awaiting your approval</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Recent Applications</CardTitle>
        <Button variant="ghost" size="sm" to="/admin/state/applications"
          >View All</Button
        >
      </CardHeader>
      <CardContent>
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead>
              <tr class="border-b">
                <th class="h-10 px-4 text-left font-medium">ID</th>
                <th class="h-10 px-4 text-left font-medium">Name</th>
                <th class="h-10 px-4 text-left font-medium">Email</th>
                <th class="h-10 px-4 text-left font-medium">Apply Date</th>
                <th class="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="application in applicationsData"
                :key="application.id"
                class="border-b"
              >
                <td class="p-4 align-middle font-medium">
                  {{ application.id }}
                </td>
                <td class="p-4 align-middle">{{ application.name }}</td>
                <td class="p-4 align-middle">{{ application.email }}</td>
                <td class="p-4 align-middle">
                  {{ new Date(application.applyDate).toLocaleDateString() }}
                </td>
                <td class="p-4 align-middle text-right">
                  <div class="flex gap-2 justify-end">
                    <Button variant="outline" size="sm">Review</Button>
                    <Button variant="default" size="sm">Approve</Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Members Overview</CardTitle>
        <Button variant="ghost" size="sm" to="/admin/state/members"
          >View All</Button
        >
      </CardHeader>
      <CardContent>
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead>
              <tr class="border-b">
                <th class="h-10 px-4 text-left font-medium">Name</th>
                <th class="h-10 px-4 text-left font-medium">Company</th>
                <th class="h-10 px-4 text-left font-medium">Join Date</th>
                <th class="h-10 px-4 text-right font-medium">Products</th>
                <th class="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="member in memberData"
                :key="member.id"
                class="border-b"
              >
                <td class="p-4 align-middle font-medium">{{ member.name }}</td>
                <td class="p-4 align-middle">{{ member.companyName }}</td>
                <td class="p-4 align-middle">
                  {{ new Date(member.joinDate).toLocaleDateString() }}
                </td>
                <td class="p-4 align-middle text-right">
                  {{ member.productsCount }}
                </td>
                <td class="p-4 align-middle text-right">
                  <Button variant="ghost" size="sm">View Profile</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
