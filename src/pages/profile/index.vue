<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>

    <!-- Profile Information Card -->
    <Card v-else-if="profile">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Button
              v-if="!isEditing"
              @click="toggleEditMode"
              class="flex items-center gap-2"
            >
              <PencilIcon class="h-4 w-4" />
              Edit Profile
            </Button>
            <div v-else class="flex gap-2">
              <Button variant="outline" @click="cancelEdit"> Cancel </Button>
              <Button
                @click="handleSaveProfile"
                :disabled="isLoading"
                class="flex items-center gap-2"
              >
                <SaveIcon class="h-4 w-4" />
                {{ isLoading ? "Saving..." : "Save" }}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent class="p-6">
        <!-- Avatar Section -->
        <div
          class="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-6 mb-6 border-b"
        >
          <Avatar class="h-24 w-24">
            <AvatarImage
              :src="profile.avatar || '/avatars/user-placeholder.jpg'"
              alt="User"
            />
            <AvatarFallback class="text-lg">
              {{ getInitials(profile.user_fullname) }}
            </AvatarFallback>
          </Avatar>
          <div class="space-y-2">
            <h3 class="text-xl font-semibold">{{ profile.user_fullname }}</h3>
            <p class="text-muted-foreground">
              {{ profile.user_email }} | {{ profile.user_mykad_number }}
            </p>
            <p class="text-sm text-muted-foreground">
              Registered on {{ formatDate(profile.user_created_at) }}
            </p>
          </div>
        </div>

        <!-- Form Fields -->
        <form @submit.prevent="handleSaveProfile">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="fullName">Full Name</Label>
              <Input
                id="fullName"
                v-model="formData.fullname"
                disabled
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="ic">MyKad Number</Label>
              <Input
                id="ic"
                v-model="formData.mykad_number"
                disabled
                placeholder="123456-78-9012"
              />
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="profile.user_email"
                disabled
                type="email"
              />
            </div>
            <div class="space-y-2">
              <Label for="state">State</Label>
              <Select v-model="formData.state" disabled>
                <SelectTrigger id="state" class="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="state in states"
                    :key="state.code"
                    :value="state.code"
                  >
                    {{ state.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="phone">Mobile Number</Label>
              <div class="flex">
                <div
                  class="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm"
                >
                  +60
                </div>
                <Input
                  id="phone"
                  v-model="mobileNumberInput"
                  :disabled="!isEditing"
                  placeholder="123456789"
                  class="rounded-l-none"
                  @input="updateMobileNumber"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="gender">Gender</Label>
              <Select v-model="formData.gender" :disabled="!isEditing">
                <SelectTrigger id="gender" class="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                v-model="formData.date_of_birth"
                :disabled="!isEditing"
                type="date"
              />
            </div>
            <div class="md:col-span-2 space-y-2">
              <Label for="address">Address</Label>
              <Textarea
                id="address"
                v-model="formData.residential_address"
                :disabled="!isEditing"
                rows="3"
                placeholder="Enter full address"
              />
            </div>
            <div class="space-y-2">
              <Label for="postcode">Postcode</Label>
              <Input
                id="postcode"
                v-model="formData.postcode"
                :disabled="!isEditing"
                placeholder="12345"
              />
            </div>
            <div class="space-y-2">
              <Label for="city">City</Label>
              <Input
                id="city"
                v-model="formData.city"
                :disabled="!isEditing"
                placeholder="City name"
              />
            </div>
            <div class="space-y-2">
              <Label for="spouseName">Spouse Name</Label>
              <Input
                id="spouseName"
                v-model="formData.spouse_name"
                :disabled="!isEditing"
                placeholder="Spouse name (optional)"
              />
            </div>
            <div class="space-y-2">
              <Label for="spousePhone">Spouse Phone</Label>
              <div class="flex">
                <div
                  class="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm"
                >
                  +60
                </div>
                <Input
                  id="spousePhone"
                  v-model="spouseMobileNumberInput"
                  :disabled="!isEditing"
                  placeholder="123456789 (optional)"
                  class="rounded-l-none"
                  @input="updateSpouseMobileNumber"
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Account Settings Card -->
    <!-- <Card v-if="profile">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription
          >Manage privacy and notification settings</CardDescription
        >
      </CardHeader>
      <CardContent class="p-6">
        <div class="space-y-6">
          <div class="flex items-center justify-between py-3">
            <div class="space-y-1">
              <h4 class="font-medium">Email Notifications</h4>
              <p class="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              v-model="notificationSettings.email_notifications"
              :disabled="!isEditing"
            />
          </div>
          <Separator />
          <div class="flex items-center justify-between py-3">
            <div class="space-y-1">
              <h4 class="font-medium">SMS Notifications</h4>
              <p class="text-sm text-muted-foreground">
                Receive notifications via SMS
              </p>
            </div>
            <Switch
              v-model="notificationSettings.sms_notifications"
              :disabled="!isEditing"
            />
          </div>
        </div>
      </CardContent>
    </Card> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue";
import { useProfile } from "@/composables/useProfile";
import { UpdateProfileRequest } from "@/types/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PencilIcon, SaveIcon } from "lucide-vue-next";
import { apiFetching } from "@/services/api-fetching";

// Composables
const {
  profile,
  isLoading,
  fetchProfile,
  updateProfile,
  updateNotificationPreferences,
} = useProfile();

// Component state
const isEditing = ref(false);

// Mobile number inputs (without +60 prefix)
const mobileNumberInput = ref("");
const spouseMobileNumberInput = ref("");

// Form data
const formData = reactive<UpdateProfileRequest>({
  fullname: "",
  mykad_number: "",
  mobile_number: "",
  gender: undefined,
  date_of_birth: "",
  residential_address: "",
  postcode: "",
  city: "",
  state: "",
  spouse_name: "",
  spouse_mobile_phone: "",
});

// Notification settings
const notificationSettings = reactive({
  email_notifications: true,
  sms_notifications: true,
});

// Computed
const hasChanges = computed(() => {
  if (!profile.value) return false;

  // Format the stored date for comparison
  const storedDate = parseDateForInput(profile.value.user_date_of_birth);

  return (
    formData.fullname !== profile.value.user_fullname ||
    formData.mykad_number !== (profile.value.user_mykad_number || "") ||
    formatMobileNumber(mobileNumberInput.value) !==
      (profile.value.user_mobile_number || "") ||
    formData.gender !== profile.value.user_gender ||
    formData.date_of_birth !== storedDate ||
    formData.residential_address !==
      (profile.value.user_residential_address || "") ||
    formData.postcode !== (profile.value.user_postcode || "") ||
    formData.city !== (profile.value.user_city || "") ||
    formData.state !== (profile.value.user_state || "") ||
    formData.spouse_name !== (profile.value.user_spouse_name || "") ||
    formatMobileNumber(spouseMobileNumberInput.value) !==
      (profile.value.user_spouse_mobile_phone || "")
  );
});

const states = ref<any[]>([]);

// Mobile number utility methods
const extractMobileNumber = (fullNumber: string): string => {
  if (!fullNumber) return "";
  // Remove +60 prefix if it exists
  return fullNumber.startsWith("+60") ? fullNumber.slice(3) : fullNumber;
};

const formatMobileNumber = (number: string): string => {
  if (!number) return "";
  // Add +60 prefix if not already present
  return number.startsWith("+60") ? number : `+60${number}`;
};

const updateMobileNumber = () => {
  formData.mobile_number = formatMobileNumber(mobileNumberInput.value);
};

const updateSpouseMobileNumber = () => {
  formData.spouse_mobile_phone = formatMobileNumber(
    spouseMobileNumberInput.value
  );
};

// Methods
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const parseDateForInput = (dateString?: string): string => {
  if (!dateString) return "";

  // If the date string is already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Handle ISO date strings from backend that have timezone conversion issues
  if (dateString.includes("T") && dateString.includes("Z")) {
    // Pattern like "2025-01-21T16:00:00.000Z" indicates backend timezone conversion
    // where T16:00:00.000Z suggests the original date was actually the next day

    // Check if this looks like a timezone-converted date from DB
    if (dateString.match(/T\d{2}:00:00\.000Z$/)) {
      // Extract the UTC date and check if we need to add a day
      const utcDate = new Date(dateString);
      const utcHour = utcDate.getUTCHours();

      // If the hour is non-zero, it suggests timezone conversion happened
      // Add a day to compensate for the backend's timezone conversion
      if (utcHour > 0) {
        utcDate.setUTCDate(utcDate.getUTCDate() + 1);
      }

      return utcDate.toISOString().split("T")[0];
    }

    // For other ISO strings, just extract the date part
    return dateString.split("T")[0];
  }

  // For other date formats, try to parse safely
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Date not available";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const populateFormData = () => {
  if (!profile.value) return;

  formData.fullname = profile.value.user_fullname || "";
  formData.mykad_number = profile.value.user_mykad_number || "";
  formData.mobile_number = profile.value.user_mobile_number || "";
  formData.gender = profile.value.user_gender;

  // Format date of birth to yyyy-MM-dd format for HTML date input
  formData.date_of_birth = parseDateForInput(profile.value.user_date_of_birth);

  formData.residential_address = profile.value.user_residential_address || "";
  formData.postcode = profile.value.user_postcode || "";
  formData.city = profile.value.user_city || "";
  formData.state = profile.value.user_state || "";
  formData.spouse_name = profile.value.user_spouse_name || "";
  formData.spouse_mobile_phone = profile.value.user_spouse_mobile_phone || "";

  // Extract mobile numbers without +60 prefix for input fields
  mobileNumberInput.value = extractMobileNumber(
    profile.value.user_mobile_number || ""
  );
  spouseMobileNumberInput.value = extractMobileNumber(
    profile.value.user_spouse_mobile_phone || ""
  );

  // Set notification preferences
  notificationSettings.email_notifications =
    profile.value.email_notifications ?? true;
  notificationSettings.sms_notifications =
    profile.value.sms_notifications ?? true;
};

const toggleEditMode = () => {
  isEditing.value = true;
  populateFormData();
};

const cancelEdit = () => {
  isEditing.value = false;
  populateFormData(); // Reset form data
};

const fetchStates = async () => {
  const response = await apiFetching().get("/states");
  states.value = response.data.states;
};

const handleSaveProfile = async () => {
  if (!hasChanges.value) {
    isEditing.value = false;
    return;
  }

  try {
    // Update form data with formatted mobile numbers before saving
    formData.mobile_number = formatMobileNumber(mobileNumberInput.value);
    formData.spouse_mobile_phone = formatMobileNumber(
      spouseMobileNumberInput.value
    );

    const success = await updateProfile(formData);
    // if (success) {
    //   isEditing.value = false;
    //   // Update notification preferences if they changed
    //   await updateNotificationPreferences(notificationSettings);
    // }

    await fetchProfile();
  } catch (error) {
    console.error("Error saving profile:", error);
  }
};

// Lifecycle
onMounted(async () => {
  await fetchProfile();
  await fetchStates();
  populateFormData();
});
</script>
