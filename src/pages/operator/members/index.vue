<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "vue-sonner";

// Define member type
interface Member {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  productsCount: number;
  joinDate: string;
  status: "active" | "inactive" | "suspended";
}

// Mock data for members
const members = ref<Member[]>([
  {
    id: "1",
    name: "Ahmad Bin Hassan",
    companyName: "Syarikat A Sdn Bhd",
    email: "ahmad@syarikata.com",
    phone: "012-3456789",
    joinDate: "2023-10-15",
    productsCount: 5,
    status: "active",
  },
  {
    id: "2",
    name: "Siti Binti Zulkifli",
    companyName: "Syarikat B Enterprise",
    email: "siti@syarikatb.com",
    phone: "012-8765432",
    joinDate: "2023-11-02",
    productsCount: 3,
    status: "active",
  },
  {
    id: "3",
    name: "Kamal Bin Razali",
    companyName: "Syarikat C Trading",
    email: "kamal@syarikatc.com",
    phone: "019-1234567",
    joinDate: "2023-11-18",
    productsCount: 8,
    status: "active",
  },
  {
    id: "4",
    name: "Nurul Binti Aziz",
    companyName: "Syarikat D Bhd",
    email: "nurul@syarikatd.com",
    phone: "011-10293847",
    joinDate: "2023-12-05",
    productsCount: 2,
    status: "suspended",
  },
  {
    id: "5",
    name: "Ismail Bin Kassim",
    companyName: "Syarikat E Resources",
    email: "ismail@syarikate.com",
    phone: "013-9876543",
    joinDate: "2024-01-10",
    productsCount: 6,
    status: "active",
  },
  {
    id: "6",
    name: "Zarina Binti Azlan",
    companyName: "Syarikat F Solutions",
    email: "zarina@syarikatf.com",
    phone: "014-1472583",
    joinDate: "2024-01-22",
    productsCount: 4,
    status: "inactive",
  },
  {
    id: "7",
    name: "Razak Bin Ibrahim",
    companyName: "Syarikat G Industries",
    email: "razak@syarikatg.com",
    phone: "016-3698521",
    joinDate: "2024-02-05",
    productsCount: 1,
    status: "active",
  },
]);

// Member details and actions
const selectedMember = ref<Member | null>(null);
const isViewDialogOpen = ref(false);
const isSuspendDialogOpen = ref(false);
const isUnsuspendDialogOpen = ref(false);
const suspensionReason = ref("");

// Search and filter
const searchQuery = ref("");
const statusFilter = ref("all");

// Computed filtered members
const filteredMembers = computed(() => {
  let result = members.value;

  // Apply status filter
  if (statusFilter.value !== "all") {
    result = result.filter((member) => member.status === statusFilter.value);
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.companyName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
    );
  }

  return result;
});

// View member details
function viewMember(member: Member) {
  selectedMember.value = member;
  isViewDialogOpen.value = true;
}

// Open suspend dialog
function openSuspendDialog(member: Member) {
  selectedMember.value = member;
  suspensionReason.value = "";
  isSuspendDialogOpen.value = true;
}

// Open unsuspend dialog
function openUnsuspendDialog(member: Member) {
  selectedMember.value = member;
  isUnsuspendDialogOpen.value = true;
}

// Suspend a member
function suspendMember() {
  if (!selectedMember.value) return;

  if (!suspensionReason.value) {
    toast.error("Please provide a reason for suspension");
    return;
  }

  const index = members.value.findIndex(
    (m) => m.id === selectedMember.value!.id
  );
  if (index !== -1) {
    members.value[index].status = "suspended";
    toast.success(`Member ${selectedMember.value.name} has been suspended`);
    isSuspendDialogOpen.value = false;
  }
}

// Reactivate a suspended member
function unsuspendMember() {
  if (!selectedMember.value) return;

  const index = members.value.findIndex(
    (m) => m.id === selectedMember.value!.id
  );
  if (index !== -1) {
    members.value[index].status = "active";
    toast.success(`Member ${selectedMember.value.name} has been reactivated`);
    isUnsuspendDialogOpen.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-8">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold md:text-2xl">Member Management</h1>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Input
        v-model="searchQuery"
        placeholder="Search by name, company or email..."
        class="max-w-sm"
      />

      <div class="flex items-center gap-2">
        <span class="text-sm">Status:</span>
        <select
          v-model="statusFilter"
          class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead>
              <tr class="border-b">
                <th class="h-10 px-4 text-left font-medium">Name</th>
                <th class="h-10 px-4 text-left font-medium">Company</th>
                <th class="h-10 px-4 text-left font-medium">Email</th>
                <th class="h-10 px-4 text-center font-medium">Products</th>
                <th class="h-10 px-4 text-center font-medium">Status</th>
                <th class="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="member in filteredMembers"
                :key="member.id"
                class="border-b"
              >
                <td class="p-4 align-middle font-medium">{{ member.name }}</td>
                <td class="p-4 align-middle">{{ member.companyName }}</td>
                <td class="p-4 align-middle">{{ member.email }}</td>
                <td class="p-4 align-middle text-center">
                  {{ member.productsCount }}
                </td>
                <td class="p-4 align-middle text-center">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : member.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                    ]"
                  >
                    {{
                      member.status.charAt(0).toUpperCase() +
                      member.status.slice(1)
                    }}
                  </span>
                </td>
                <td class="p-4 align-middle text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="viewMember(member)"
                    >
                      View
                    </Button>
                    <Button
                      v-if="member.status === 'active'"
                      variant="outline"
                      size="sm"
                      @click="openSuspendDialog(member)"
                    >
                      Suspend
                    </Button>
                    <Button
                      v-if="member.status === 'suspended'"
                      variant="outline"
                      size="sm"
                      @click="openUnsuspendDialog(member)"
                    >
                      Reactivate
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- View Member Dialog -->
    <Dialog v-model:open="isViewDialogOpen">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>
            View member information and product details.
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedMember" class="grid gap-4 py-4">
          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Name:</div>
            <div class="col-span-3">{{ selectedMember.name }}</div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Company:</div>
            <div class="col-span-3">{{ selectedMember.companyName }}</div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Email:</div>
            <div class="col-span-3">{{ selectedMember.email }}</div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Phone:</div>
            <div class="col-span-3">{{ selectedMember.phone }}</div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Join Date:</div>
            <div class="col-span-3">
              {{ new Date(selectedMember.joinDate).toLocaleDateString() }}
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Products:</div>
            <div class="col-span-3">
              {{ selectedMember.productsCount }} registered products
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1 text-sm font-medium">Status:</div>
            <div class="col-span-3">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  selectedMember.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : selectedMember.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                ]"
              >
                {{
                  selectedMember.status.charAt(0).toUpperCase() +
                  selectedMember.status.slice(1)
                }}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isViewDialogOpen = false"
            >Close</Button
          >
          <Button
            v-if="selectedMember && selectedMember.status === 'active'"
            variant="outline"
            @click="openSuspendDialog(selectedMember)"
          >
            Suspend Member
          </Button>
          <Button
            v-if="selectedMember && selectedMember.status === 'suspended'"
            variant="outline"
            @click="openUnsuspendDialog(selectedMember)"
          >
            Reactivate Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Suspend Member Dialog -->
    <Dialog v-model:open="isSuspendDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend Member</DialogTitle>
          <DialogDescription>
            This will temporarily suspend the member's account.
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedMember" class="grid gap-4 py-4">
          <div>
            <p>
              <span class="font-medium">Name:</span> {{ selectedMember.name }}
            </p>
            <p>
              <span class="font-medium">Company:</span>
              {{ selectedMember.companyName }}
            </p>
          </div>

          <div class="grid gap-2">
            <label for="reason" class="text-sm font-medium"
              >Suspension Reason</label
            >
            <textarea
              id="reason"
              v-model="suspensionReason"
              placeholder="Provide a reason for suspension..."
              rows="3"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isSuspendDialogOpen = false"
            >Cancel</Button
          >
          <Button variant="destructive" @click="suspendMember">Suspend</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Unsuspend Member Dialog -->
    <Dialog v-model:open="isUnsuspendDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reactivate Member</DialogTitle>
          <DialogDescription>
            This will reactivate the member's suspended account.
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedMember" class="py-4">
          <p>
            <span class="font-medium">Name:</span> {{ selectedMember.name }}
          </p>
          <p>
            <span class="font-medium">Company:</span>
            {{ selectedMember.companyName }}
          </p>
          <p class="mt-2">
            Are you sure you want to reactivate this member's account?
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isUnsuspendDialogOpen = false"
            >Cancel</Button
          >
          <Button @click="unsuspendMember">Reactivate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
