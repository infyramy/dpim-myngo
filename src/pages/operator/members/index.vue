<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
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
import { useMembers, type Member } from "@/composables/useMembers";

// Members composable
const {
  members,
  isLoading,
  isSubmitting,
  pagination,
  fetchMembers,
  fetchMemberById,
  suspendMember: suspendMemberApi,
  reactivateMember: reactivateMemberApi,
  refreshMembers,
} = useMembers();

// Member details and actions
const selectedMember = ref<Member | null>(null);
const isViewDialogOpen = ref(false);
const isSuspendDialogOpen = ref(false);
const isUnsuspendDialogOpen = ref(false);
const suspensionReason = ref("");

// Search and filter
const searchQuery = ref("");
const statusFilter = ref("all");

// Computed for better empty state handling
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== "" || statusFilter.value !== "all";
});

const isLoadingMemberDetails = ref(false);

// Since we're handling filtering on the server side, we just return the members
const filteredMembers = computed(() => members.value);

// Load members function
const loadMembers = async () => {
  await fetchMembers({
    search: searchQuery.value || undefined,
    status: statusFilter.value !== "all" ? statusFilter.value : undefined,
    page: pagination.value.page,
    limit: pagination.value.limit,
  });
};

// View member details
async function viewMember(member: Member) {
  try {
    isLoadingMemberDetails.value = true;
    isViewDialogOpen.value = true;
    selectedMember.value = member; // Show basic info first
    
    // Fetch detailed member information
    const detailedMember = await fetchMemberById(member.id);
    selectedMember.value = detailedMember;
  } catch (error) {
    console.error("Failed to load member details:", error);
    // Keep basic member info if detailed fetch fails
  } finally {
    isLoadingMemberDetails.value = false;
  }
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
async function suspendMember() {
  if (!selectedMember.value) return;

  const success = await suspendMemberApi(
    selectedMember.value.id,
    suspensionReason.value
  );
  if (success) {
    isSuspendDialogOpen.value = false;
    // Reload members to get updated data
    await loadMembers();
  }
}

// Reactivate a suspended member
async function unsuspendMember() {
  if (!selectedMember.value) return;

  const success = await reactivateMemberApi(selectedMember.value.id);
  if (success) {
    isUnsuspendDialogOpen.value = false;
    // Reload members to get updated data
    await loadMembers();
  }
}

// Watch for search and filter changes
const handleSearchOrFilterChange = () => {
  pagination.value.page = 1; // Reset to first page
  loadMembers();
};

// Initialize data on mount
onMounted(() => {
  loadMembers();
});
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-8">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold md:text-2xl">Member Management</h1>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Input
        v-model="searchQuery"
        placeholder="Search by name or email..."
        class="max-w-sm"
        @input="handleSearchOrFilterChange"
      />

      <div class="flex items-center gap-2">
        <span class="text-sm">Status:</span>
        <select
          v-model="statusFilter"
          class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          @change="handleSearchOrFilterChange"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Button variant="outline" @click="loadMembers" :disabled="isLoading">
        Refresh
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
            <CardContent>
        <!-- Loading State -->
        <div v-if="isLoading" class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead>
              <tr class="border-b">
                <th class="h-10 px-4 text-left font-medium">Name</th>
                <th class="h-10 px-4 text-left font-medium">Email</th>
                <th class="h-10 px-4 text-center font-medium">Businesses</th>
                <th class="h-10 px-4 text-center font-medium">Products</th>
                <th class="h-10 px-4 text-center font-medium">Status</th>
                <th class="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="i" class="border-b animate-pulse">
                <td class="p-4 align-middle">
                  <div class="h-4 bg-muted rounded w-32"></div>
                </td>
                <td class="p-4 align-middle">
                  <div class="h-4 bg-muted rounded w-40"></div>
                </td>
                <td class="p-4 align-middle text-center">
                  <div class="h-4 bg-muted rounded w-8 mx-auto"></div>
                </td>
                <td class="p-4 align-middle text-center">
                  <div class="h-4 bg-muted rounded w-8 mx-auto"></div>
                </td>
                <td class="p-4 align-middle text-center">
                  <div class="h-6 bg-muted rounded-full w-16 mx-auto"></div>
                </td>
                <td class="p-4 align-middle text-right">
                  <div class="flex justify-end gap-2">
                    <div class="h-8 bg-muted rounded w-16"></div>
                    <div class="h-8 bg-muted rounded w-20"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredMembers.length === 0" class="text-center py-12">
          <div class="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              class="h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2">
            {{ hasActiveFilters ? "No members found" : "No members yet" }}
          </h3>
          <p class="text-muted-foreground mb-4 max-w-md mx-auto">
            {{
              hasActiveFilters
                ? "Try adjusting your search criteria or reset filters to see more members."
                : "No members have joined the platform yet. Members will appear here once they register."
            }}
          </p>
          <div class="flex justify-center gap-2" v-if="hasActiveFilters">
            <Button
              variant="outline"
              @click="searchQuery = ''; statusFilter = 'all'; handleSearchOrFilterChange();"
              class="flex items-center gap-2"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </Button>
          </div>
        </div>

        <!-- Members Table -->
        <div v-else class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead>
              <tr class="border-b">
                <th class="h-10 px-4 text-left font-medium">Name</th>
                <th class="h-10 px-4 text-left font-medium">Email</th>
                <th class="h-10 px-4 text-center font-medium">Businesses</th>
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
                <td class="p-4 align-middle">{{ member.email }}</td>
                <td class="p-4 align-middle text-center">
                  {{ member.businessesCount }}
                </td>
                <td class="p-4 align-middle text-center">
                  {{ member.productsCount }}
                </td>
                <td class="p-4 align-middle text-center">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : member.status === 'pending'
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
                      :disabled="isSubmitting"
                    >
                      View
                    </Button>
                    <Button
                      v-if="member.status === 'active'"
                      variant="outline"
                      size="sm"
                      @click="openSuspendDialog(member)"
                      :disabled="isSubmitting"
                    >
                      Suspend
                    </Button>
                    <Button
                      v-if="member.status === 'suspended'"
                      variant="outline"
                      size="sm"
                      @click="openUnsuspendDialog(member)"
                      :disabled="isSubmitting"
                    >
                      Reactivate
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination.total > 0"
          class="flex items-center justify-between px-2 py-4"
        >
          <div class="text-sm text-muted-foreground">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
            of {{ pagination.total }} members
          </div>

          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="pagination.page <= 1 || isLoading"
              @click="
                pagination.page--;
                loadMembers();
              "
            >
              Previous
            </Button>

            <span class="text-sm">
              Page {{ pagination.page }} of {{ pagination.totalPages }}
            </span>

            <Button
              variant="outline"
              size="sm"
              :disabled="pagination.page >= pagination.totalPages || isLoading"
              @click="
                pagination.page++;
                loadMembers();
              "
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- View Member Dialog -->
    <Dialog v-model:open="isViewDialogOpen">
      <DialogContent class="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
        <!-- Fixed Header -->
        <DialogHeader class="px-6 py-4 border-b">
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>
            Comprehensive member information and activity details.
          </DialogDescription>
        </DialogHeader>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto px-6 py-4 relative">
          <!-- Loading overlay for member details -->
          <div 
            v-if="isLoadingMemberDetails"
            class="absolute inset-0 bg-background/80 flex items-center justify-center z-10"
          >
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Loading detailed information...
            </div>
          </div>

          <div v-if="selectedMember" class="grid gap-6">
            <!-- Member Header -->
            <div>
              <div class="flex items-start justify-between mb-3">
                <h2 class="text-2xl font-bold">{{ selectedMember.name }}</h2>
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                    selectedMember.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : selectedMember.status === 'pending'
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
              <p class="text-muted-foreground">
                Member since
                {{ new Date(selectedMember.joinDate).toLocaleDateString() }}
              </p>
            </div>

            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-3">Contact Information</h3>
              <div class="grid gap-3">
                <div class="flex items-center gap-3">
                  <div class="text-sm font-medium min-w-[100px]">Email:</div>
                  <div class="text-sm">{{ selectedMember.email }}</div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-sm font-medium min-w-[100px]">Phone:</div>
                  <div class="text-sm">
                    {{ selectedMember.phone || "Not provided" }}
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-sm font-medium min-w-[100px]">
                    Last Login:
                  </div>
                  <div class="text-sm">
                    {{
                      selectedMember.lastLogin
                        ? new Date(selectedMember.lastLogin).toLocaleString()
                        : "Never logged in"
                    }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Statistics -->
            <div class="grid grid-cols-2 gap-4">
              <div class="border rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-primary">
                  {{ selectedMember.businessesCount || 0 }}
                </div>
                <div class="text-sm text-muted-foreground">
                  Registered Businesses
                </div>
              </div>
              <div class="border rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-primary">
                  {{ selectedMember.productsCount || 0 }}
                </div>
                <div class="text-sm text-muted-foreground">Listed Products</div>
              </div>
            </div>

            <!-- Businesses Section -->
            <div
              v-if="
                selectedMember.businesses &&
                selectedMember.businesses.length > 0
              "
            >
              <h3 class="font-semibold mb-3">Registered Businesses</h3>
              <div class="space-y-3">
                <div
                  v-for="business in selectedMember.businesses"
                  :key="business.id"
                  class="border rounded-lg p-4"
                >
                  <div class="flex items-start justify-between mb-2">
                    <h4 class="font-medium">{{ business.name }}</h4>
                    <div class="flex gap-2">
                      <span
                        class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {{ business.type }}
                      </span>
                      <span
                        class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                      >
                        {{ business.sector }}
                      </span>
                    </div>
                  </div>
                  <div class="text-sm text-muted-foreground space-y-1">
                    <div>SSM: {{ business.ssm }}</div>
                    <div
                      v-if="business.mofRegistration"
                      class="flex items-center gap-2"
                    >
                      <span
                        class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                        >MOF Registered</span
                      >
                      <span v-if="business.mofRegistrationNumber">{{
                        business.mofRegistrationNumber
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="border rounded-lg p-6 text-center text-muted-foreground"
            >
              <div class="text-4xl mb-2">🏢</div>
              <div>No businesses registered yet</div>
            </div>

            <!-- Products Section -->
            <div
              v-if="
                selectedMember.products && selectedMember.products.length > 0
              "
            >
              <h3 class="font-semibold mb-3">Listed Products</h3>
              <div class="space-y-3 max-h-60 overflow-y-auto">
                <div
                  v-for="product in selectedMember.products"
                  :key="product.id"
                  class="border rounded-lg p-3"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-medium text-sm">{{ product.name }}</h4>
                      <p class="text-xs text-muted-foreground">
                        {{ product.businessName }}
                      </p>
                    </div>
                    <div class="text-right">
                      <span
                        class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                      >
                        {{ product.category }}
                      </span>
                      <div class="text-xs text-muted-foreground mt-1">
                        {{ new Date(product.createdAt).toLocaleDateString() }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="border rounded-lg p-6 text-center text-muted-foreground"
            >
              <div class="text-4xl mb-2">📦</div>
              <div>No products listed yet</div>
            </div>
          </div>
        </div>

        <!-- Fixed Footer -->
        <div class="px-6 py-4 border-t bg-muted/30">
          <div class="flex justify-between items-center">
            <Button variant="outline" @click="isViewDialogOpen = false">
              Close
            </Button>
            <div class="flex gap-2">
              <Button
                v-if="selectedMember && selectedMember.status === 'active'"
                variant="destructive"
                size="sm"
                :disabled="isSubmitting"
                @click="
                  openSuspendDialog(selectedMember);
                  isViewDialogOpen = false;
                "
              >
                Suspend Member
              </Button>
              <Button
                v-if="selectedMember && selectedMember.status === 'suspended'"
                variant="default"
                size="sm"
                :disabled="isSubmitting"
                @click="
                  openUnsuspendDialog(selectedMember);
                  isViewDialogOpen = false;
                "
              >
                Reactivate Member
              </Button>
            </div>
          </div>
        </div>
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
          <Button 
            variant="outline" 
            @click="isSuspendDialogOpen = false"
            :disabled="isSubmitting"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            @click="suspendMember"
            :disabled="isSubmitting"
            class="flex items-center gap-2"
          >
            <div
              v-if="isSubmitting"
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            ></div>
            {{ isSubmitting ? "Suspending..." : "Suspend" }}
          </Button>
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
          <Button 
            variant="outline" 
            @click="isUnsuspendDialogOpen = false"
            :disabled="isSubmitting"
          >
            Cancel
          </Button>
          <Button 
            @click="unsuspendMember"
            :disabled="isSubmitting"
            class="flex items-center gap-2"
          >
            <div
              v-if="isSubmitting"
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            ></div>
            {{ isSubmitting ? "Reactivating..." : "Reactivate" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
