<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "vue-sonner";
import { apiFetching } from "@/services/api-fetching";

// Define application type
interface Application {
  id: string;
  fullname: string;
  email: string;
  mykad_number: string;
  address: string;
  apply_at: string;
  status: string;
  rejectionReason?: string;
}

// Mock data for member applications
const applications = ref<Application[]>([]);

// Application review
const selectedApplication = ref<Application | null>(null);
const isReviewDialogOpen = ref(false);
const isApproveDialogOpen = ref(false);
const isRejectDialogOpen = ref(false);
const rejectionReason = ref("");

// Function to open review dialog
function openReviewDialog(application: Application) {
  selectedApplication.value = application;
  isReviewDialogOpen.value = true;
}

// Function to open approve dialog
function openApproveDialog(application: Application) {
  selectedApplication.value = application;
  isApproveDialogOpen.value = true;
}

// Function to open reject dialog
function openRejectDialog(application: Application) {
  selectedApplication.value = application;
  rejectionReason.value = "";
  isRejectDialogOpen.value = true;
}

// Function to approve application
async function approveApplication() {
  if (!selectedApplication.value) return;

  try {
    await apiFetching().post(
      "/applications/approve",
      {
        id: selectedApplication.value.id,
      },
      true
    );

    toast.success(`Application ${selectedApplication.value.fullname} approved`);
    isApproveDialogOpen.value = false;
    await fetchApplications();
  } catch (error) {
    console.log("Error approving application:", error);
    toast.error("Failed to approve application");
  }
}

// Function to reject application
async function rejectApplication() {
  if (!selectedApplication.value) return;

  if (!rejectionReason.value) {
    toast.error("Please provide a reason for rejection");
    return;
  }

  try {
    await apiFetching().post(
      "/applications/reject",
      {
        id: selectedApplication.value.id,
        reason: rejectionReason.value,
      },
      true
    );

    toast.success(
      `Application ${selectedApplication.value.fullname} rejected`
    );
    isRejectDialogOpen.value = false;
    await fetchApplications();
  } catch (error) {
    console.log("Error rejecting application:", error);
    toast.error("Failed to reject application");
  }
}

// Filter for applications
const searchQuery = ref("");
const filteredApplications = computed(() => {
  if (!searchQuery.value) return applications.value;

  const query = searchQuery.value.toLowerCase();
  return applications.value.filter(
    (app) =>
      app.fullname.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query)
  );
});

async function fetchApplications() {
  try {
    const response = await apiFetching().get("/applications", true);

    console.log("Applications:", response.data.applications);

    applications.value = response.data.applications;
  } catch (error) {
    console.log("Error fetching applications:", error);
  }
}

onMounted(async () => {
  await fetchApplications();
});
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-8">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold md:text-2xl">Member Applications</h1>
    </div>

    <div class="flex items-center gap-2">
      <Input
        v-model="searchQuery"
        placeholder="Search by name, email or ID..."
        class="max-w-sm"
      />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Pending Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead>
              <tr class="border-b">
                <th class="h-10 px-4 text-left font-medium">No</th>
                <th class="h-10 px-4 text-left font-medium">Name</th>
                <th class="h-10 px-4 text-left font-medium">Email</th>
                <th class="h-10 px-4 text-left font-medium">Apply Date</th>
                <th class="h-10 px-4 text-center font-medium">Status</th>
                <th class="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(application, index) in filteredApplications"
                :key="application.id"
                class="border-b"
              >
                <td class="p-4 align-middle font-medium">
                  {{ index + 1 }}
                </td>
                <td class="p-4 align-middle">{{ application.fullname }}</td>
                <td class="p-4 align-middle">{{ application.email }}</td>
                <td class="p-4 align-middle">
                  {{ new Date(application.apply_at).toLocaleDateString() }}
                </td>
                <td class="p-4 align-middle text-center">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      application.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : application.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                    ]"
                  >
                    {{
                      application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)
                    }}
                  </span>
                </td>
                <td class="p-4 align-middle text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="openReviewDialog(application)"
                    >
                      Review
                    </Button>
                    <Button
                      v-if="application.status === 'pending'"
                      variant="default"
                      size="sm"
                      @click="openApproveDialog(application)"
                    >
                      Approve
                    </Button>
                    <Button
                      v-if="application.status === 'pending'"
                      variant="destructive"
                      size="sm"
                      @click="openRejectDialog(application)"
                    >
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Review Application Dialog -->
    <Dialog v-model:open="isReviewDialogOpen">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Review the member application information.
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedApplication" class="grid gap-4 py-4">
          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">ID:</div>
            <div class="col-span-3">{{ selectedApplication.id }}</div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Name:</div>
            <div class="col-span-3">{{ selectedApplication.fullname }}</div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Email:</div>
            <div class="col-span-3">{{ selectedApplication.email }}</div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">MyKad Number:</div>
            <div class="col-span-3">{{ selectedApplication.mykad_number }}</div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Address:</div>
            <div class="col-span-3">{{ selectedApplication.address }}</div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Apply Date:</div>
            <div class="col-span-3">
              {{ new Date(selectedApplication.apply_at).toLocaleDateString() }}
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Status:</div>
            <div class="col-span-3">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  selectedApplication.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    : selectedApplication.status === 'approved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                ]"
              >
                {{
                  selectedApplication.status.charAt(0).toUpperCase() +
                  selectedApplication.status.slice(1)
                }}
              </span>
            </div>
          </div>

          <div
            v-if="selectedApplication.rejectionReason"
            class="grid grid-cols-4 gap-4"
          >
            <div class="col-span-1 text-sm font-medium">Rejection Reason:</div>
            <div class="col-span-3">
              {{ selectedApplication.rejectionReason }}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isReviewDialogOpen = false"
            >Close</Button
          >
          <Button
            v-if="
              selectedApplication && selectedApplication.status === 'pending'
            "
            @click="openApproveDialog(selectedApplication)"
          >
            Approve
          </Button>
          <Button
            v-if="
              selectedApplication && selectedApplication.status === 'pending'
            "
            variant="destructive"
            @click="openRejectDialog(selectedApplication)"
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Approve Application Dialog -->
    <Dialog v-model:open="isApproveDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Application</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this application?
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedApplication" class="py-4">
          <p>
            <span class="font-medium">Name:</span>
            {{ selectedApplication.fullname }}
          </p>
          <p>
            <span class="font-medium">Email:</span>
            {{ selectedApplication.email }}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isApproveDialogOpen = false"
            >Cancel</Button
          >
          <Button @click="approveApplication">Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reject Application Dialog -->
    <Dialog v-model:open="isRejectDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this application.
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedApplication" class="grid gap-4 py-4">
          <div>
            <p>
              <span class="font-medium">Name:</span>
              {{ selectedApplication.fullname }}
            </p>
            <p>
              <span class="font-medium">Email:</span>
              {{ selectedApplication.email }}
            </p>
          </div>

          <div class="grid gap-2">
            <label for="reason" class="text-sm font-medium"
              >Rejection Reason</label
            >
            <textarea
              id="reason"
              v-model="rejectionReason"
              placeholder="Provide a reason for rejection..."
              rows="3"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isRejectDialogOpen = false"
            >Cancel</Button
          >
          <Button variant="destructive" @click="rejectApplication"
            >Reject</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
