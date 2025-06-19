<script setup lang="ts">
import { ref } from "vue";
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

// Mock data for states
const states = ref([
  {
    id: "1",
    name: "Selangor",
    adminName: "Ahmad Bin Kassim",
    adminEmail: "admin.selangor@dpim.org",
    isActive: true,
  },
  {
    id: "2",
    name: "Kuala Lumpur",
    adminName: "Siti Binti Hamid",
    adminEmail: "admin.kl@dpim.org",
    isActive: true,
  },
  {
    id: "3",
    name: "Johor",
    adminName: "Kamal Bin Razali",
    adminEmail: "admin.johor@dpim.org",
    isActive: true,
  },
  {
    id: "4",
    name: "Pulau Pinang",
    adminName: "Nurul Binti Aziz",
    adminEmail: "admin.pp@dpim.org",
    isActive: true,
  },
  {
    id: "5",
    name: "Sabah",
    adminName: "Ismail Bin Kassim",
    adminEmail: "admin.sabah@dpim.org",
    isActive: true,
  },
  { id: "6", name: "Sarawak", adminName: "", adminEmail: "", isActive: false },
  { id: "7", name: "Pahang", adminName: "", adminEmail: "", isActive: false },
  { id: "8", name: "Perak", adminName: "", adminEmail: "", isActive: false },
  {
    id: "9",
    name: "Terengganu",
    adminName: "",
    adminEmail: "",
    isActive: false,
  },
  { id: "10", name: "Kedah", adminName: "", adminEmail: "", isActive: false },
  {
    id: "11",
    name: "Negeri Sembilan",
    adminName: "",
    adminEmail: "",
    isActive: false,
  },
  { id: "12", name: "Melaka", adminName: "", adminEmail: "", isActive: false },
  { id: "13", name: "Perlis", adminName: "", adminEmail: "", isActive: false },
  {
    id: "14",
    name: "Kelantan",
    adminName: "",
    adminEmail: "",
    isActive: false,
  },
]);

// Form values for new admin
const selectedState = ref<string | null>(null);
const newAdminName = ref("");
const newAdminEmail = ref("");
const isDialogOpen = ref(false);

// Function to assign new admin
function assignAdmin() {
  if (!selectedState.value || !newAdminName.value || !newAdminEmail.value) {
    toast.error("Please fill all the fields");
    return;
  }

  // Find the state in our list
  const stateIndex = states.value.findIndex(
    (state) => state.id === selectedState.value
  );

  if (stateIndex === -1) {
    toast.error("Invalid state selected");
    return;
  }

  // Update the state with new admin
  states.value[stateIndex].adminName = newAdminName.value;
  states.value[stateIndex].adminEmail = newAdminEmail.value;
  states.value[stateIndex].isActive = true;

  // Reset form and close dialog
  toast.success(
    `Admin assigned to ${states.value[stateIndex].name} successfully`
  );
  resetForm();
  isDialogOpen.value = false;
}

// Function to remove admin
function removeAdmin(stateId: string) {
  const stateIndex = states.value.findIndex((state) => state.id === stateId);

  if (stateIndex === -1) {
    toast.error("Invalid state selected");
    return;
  }

  // Update the state with empty admin
  const stateName = states.value[stateIndex].name;
  states.value[stateIndex].adminName = "";
  states.value[stateIndex].adminEmail = "";
  states.value[stateIndex].isActive = false;

  toast.success(`Admin removed from ${stateName}`);
}

// Reset form values
function resetForm() {
  selectedState.value = null;
  newAdminName.value = "";
  newAdminEmail.value = "";
}

// Open dialog for specific state
function openAssignDialog(stateId: string) {
  selectedState.value = stateId;
  isDialogOpen.value = true;
}
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-8">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold md:text-2xl">State Branch Management</h1>

      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger as-child>
          <Button>Assign New Admin</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign State Administrator</DialogTitle>
            <DialogDescription>
              Create a new Negeri Admin account for a state branch.
            </DialogDescription>
          </DialogHeader>

          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <label for="state" class="text-sm font-medium"
                >Select State</label
              >
              <select
                id="state"
                v-model="selectedState"
                class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled selected>Select a state...</option>
                <option
                  v-for="state in states"
                  :key="state.id"
                  :value="state.id"
                >
                  {{ state.name }}
                </option>
              </select>
            </div>

            <div class="grid gap-2">
              <label for="name" class="text-sm font-medium">Admin Name</label>
              <Input
                id="name"
                v-model="newAdminName"
                placeholder="Full name of administrator"
              />
            </div>

            <div class="grid gap-2">
              <label for="email" class="text-sm font-medium">Admin Email</label>
              <Input
                id="email"
                v-model="newAdminEmail"
                placeholder="Email address"
                type="email"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="isDialogOpen = false"
              >Cancel</Button
            >
            <Button @click="assignAdmin">Assign Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>State Branches</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead>
              <tr class="border-b">
                <th class="h-10 px-4 text-left font-medium">State</th>
                <th class="h-10 px-4 text-left font-medium">Admin Name</th>
                <th class="h-10 px-4 text-left font-medium">Admin Email</th>
                <th class="h-10 px-4 text-center font-medium">Status</th>
                <th class="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="state in states" :key="state.id" class="border-b">
                <td class="p-4 align-middle font-medium">{{ state.name }}</td>
                <td class="p-4 align-middle">
                  {{ state.adminName || "Not assigned" }}
                </td>
                <td class="p-4 align-middle">
                  {{ state.adminEmail || "Not assigned" }}
                </td>
                <td class="p-4 align-middle text-center">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      state.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                    ]"
                  >
                    {{ state.isActive ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td class="p-4 align-middle text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      v-if="!state.isActive"
                      variant="outline"
                      size="sm"
                      @click="openAssignDialog(state.id)"
                    >
                      Assign Admin
                    </Button>
                    <Button v-if="state.isActive" variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button
                      v-if="state.isActive"
                      variant="destructive"
                      size="sm"
                      @click="removeAdmin(state.id)"
                    >
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
