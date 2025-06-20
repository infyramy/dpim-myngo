<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Add New Business</h1>
        <p class="text-muted-foreground mt-1">
          Register your business information
        </p>
      </div>
      <Button variant="outline" @click="goBack" class="flex items-center gap-2">
        <ArrowLeftIcon class="h-4 w-4" />
        Back to Businesses
      </Button>
    </div>

    <!-- Form Card -->
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          Please fill in all the required information to register your business.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Company Name -->
            <div class="md:col-span-2">
              <Label for="companyName" class="text-sm font-medium">
                Company Name <span class="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                v-model="formData.name"
                placeholder="Your company name"
                :class="{ 'border-red-500': formErrors.name }"
                class="mt-1"
                required
              />
              <p v-if="formErrors.name" class="text-red-500 text-xs mt-1">
                {{ formErrors.name }}
              </p>
            </div>

            <!-- SSM Number -->
            <div>
              <Label for="ssmNumber" class="text-sm font-medium">
                SSM Number <span class="text-red-500">*</span>
              </Label>
              <Input
                id="ssmNumber"
                v-model="formData.ssm"
                placeholder="SSM registration number (12 digits)"
                :class="{ 'border-red-500': formErrors.ssm }"
                class="mt-1"
                maxlength="12"
                required
              />
              <p v-if="formErrors.ssm" class="text-red-500 text-xs mt-1">
                {{ formErrors.ssm }}
              </p>
            </div>

            <!-- Office Phone -->
            <div>
              <Label for="officePhone" class="text-sm font-medium">
                Office Phone <span class="text-red-500">*</span>
              </Label>
              <Input
                id="officePhone"
                v-model="formData.phone"
                placeholder="Office phone number (e.g., 03-1234-5678)"
                :class="{ 'border-red-500': formErrors.phone }"
                class="mt-1"
                required
              />
              <p v-if="formErrors.phone" class="text-red-500 text-xs mt-1">
                {{ formErrors.phone }}
              </p>
            </div>

            <!-- Business Address -->
            <div class="md:col-span-2">
              <Label for="businessAddress" class="text-sm font-medium">
                Business Address <span class="text-red-500">*</span>
              </Label>
              <Textarea
                id="businessAddress"
                v-model="formData.address"
                placeholder="Your business address"
                :class="{ 'border-red-500': formErrors.address }"
                class="mt-1"
                rows="3"
                required
              />
              <p v-if="formErrors.address" class="text-red-500 text-xs mt-1">
                {{ formErrors.address }}
              </p>
            </div>

            <!-- Business Type -->
            <div>
              <Label for="businessType" class="text-sm font-medium">
                Business Type <span class="text-red-500">*</span>
              </Label>
              <Select v-model="formData.type" required>
                <SelectTrigger
                  id="businessType"
                  :class="{ 'border-red-500': formErrors.type }"
                  class="w-full mt-1"
                >
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in BUSINESS_TYPE_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="formErrors.type" class="text-red-500 text-xs mt-1">
                {{ formErrors.type }}
              </p>
            </div>

            <!-- Business Sector -->
            <div>
              <Label for="businessSector" class="text-sm font-medium">
                Business Sector <span class="text-red-500">*</span>
              </Label>
              <Select v-model="formData.sector" required>
                <SelectTrigger
                  id="businessSector"
                  :class="{ 'border-red-500': formErrors.sector }"
                  class="w-full mt-1"
                >
                  <SelectValue placeholder="Select business sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in BUSINESS_SECTOR_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="formErrors.sector" class="text-red-500 text-xs mt-1">
                {{ formErrors.sector }}
              </p>
            </div>

            <!-- Business Category -->
            <div>
              <Label for="businessCategory" class="text-sm font-medium">
                Business Category <span class="text-red-500">*</span>
              </Label>
              <Select v-model="formData.category" required>
                <SelectTrigger
                  id="businessCategory"
                  :class="{ 'border-red-500': formErrors.category }"
                  class="w-full mt-1"
                >
                  <SelectValue placeholder="Select business category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in BUSINESS_CATEGORY_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="formErrors.category" class="text-red-500 text-xs mt-1">
                {{ formErrors.category }}
              </p>
            </div>

            <!-- MOF Registration -->
            <div>
              <Label class="text-sm font-medium">MOF Registration</Label>
              <RadioGroup
                :model-value="formData.mofRegistration ? 'yes' : 'no'"
                @update:model-value="
                  (value) => (formData.mofRegistration = value === 'yes')
                "
                class="flex gap-4 mt-2"
              >
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="mof-yes" />
                  <Label for="mof-yes">Yes</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="mof-no" />
                  <Label for="mof-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <!-- MOF Registration Number (conditional) -->
            <div v-if="formData.mofRegistration">
              <Label for="mofRegistrationNumber" class="text-sm font-medium">
                MOF Registration Number <span class="text-red-500">*</span>
              </Label>
              <Input
                id="mofRegistrationNumber"
                v-model="formData.mofRegistrationNumber"
                placeholder="MOF registration number"
                :class="{ 'border-red-500': formErrors.mofRegistrationNumber }"
                class="mt-1"
                required
              />
              <p
                v-if="formErrors.mofRegistrationNumber"
                class="text-red-500 text-xs mt-1"
              >
                {{ formErrors.mofRegistrationNumber }}
              </p>
            </div>

            <!-- Business URL -->
            <div class="md:col-span-2">
              <Label for="businessUrl" class="text-sm font-medium">
                Business Website (Optional)
              </Label>
              <Input
                id="businessUrl"
                :model-value="formData.url || ''"
                @update:model-value="(value) => (formData.url = String(value))"
                placeholder="https://example.com (if any)"
                :class="{ 'border-red-500': formErrors.url }"
                class="mt-1"
                type="url"
              />
              <p v-if="formErrors.url" class="text-red-500 text-xs mt-1">
                {{ formErrors.url }}
              </p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              @click="goBack"
              :disabled="isSubmitting"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              :disabled="isSubmitting"
              class="flex items-center gap-2 min-w-[120px]"
            >
              <div
                v-if="isSubmitting"
                class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              ></div>
              {{ isSubmitting ? "Saving..." : "Save Business" }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon } from "lucide-vue-next";
import { toast } from "vue-sonner";

// Types and composables
import { useBusiness } from "@/composables/useBusiness";
import type {
  BusinessFormData,
  BusinessValidationErrors,
} from "@/types/business";
// import {
//   BUSINESS_TYPE_OPTIONS,
//   BUSINESS_SECTOR_OPTIONS,
//   BUSINESS_CATEGORY_OPTIONS,
// } from "@/types/business";

import { apiFetching } from "@/services/api-fetching";

// Router
const router = useRouter();

// Business composable
const { isSubmitting, validateBusinessForm, createEmptyFormData } =
  useBusiness();

const BUSINESS_TYPE_OPTIONS = ref<any[]>([]);
const BUSINESS_SECTOR_OPTIONS = ref<any[]>([]);
const BUSINESS_CATEGORY_OPTIONS = ref<any[]>([]);

// Form data and validation
const formData = ref<BusinessFormData>(createEmptyFormData());
const formErrors = ref<BusinessValidationErrors>({});

// Navigation
const goBack = () => {
  router.push("/user/businesses");
};

// Form submission
const handleSubmit = async () => {
  // Validate form
  formErrors.value = validateBusinessForm(formData.value);

  if (Object.keys(formErrors.value).length > 0) {
    // Scroll to first error
    const firstErrorField = Object.keys(formErrors.value)[0];
    const element = document.getElementById(getFieldId(firstErrorField));
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus();
    }
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await apiFetching().post(
      "/businesses",
      formData.value,
      true
    );
    setTimeout(() => {
      toast.success(response.message);
      router.push("/user/businesses");
    }, 1000);
  } catch (error: any) {
    console.error("Create business error:", error.data.message);
    toast.error(error.data.message);

    isSubmitting.value = false;
  }
};

// Helper function to get field ID from error key
const getFieldId = (errorKey: string): string => {
  const fieldIdMap: Record<string, string> = {
    name: "companyName",
    ssm: "ssmNumber",
    address: "businessAddress",
    phone: "officePhone",
    type: "businessType",
    sector: "businessSector",
    category: "businessCategory",
    mofRegistrationNumber: "mofRegistrationNumber",
    url: "businessUrl",
  };
  return fieldIdMap[errorKey] || errorKey;
};

async function fetchLookup() {
  try {
    const bt = await apiFetching().get(`/lookup?lookup_group=business_type`);
    console.log("response.data: ", bt.data.lookup_data);

    BUSINESS_TYPE_OPTIONS.value = bt.data.lookup_data;

    const bs = await apiFetching().get(`/lookup?lookup_group=business_sector`);
    console.log("response.data: ", bs.data.lookup_data);

    BUSINESS_SECTOR_OPTIONS.value = bs.data.lookup_data;

    const bc = await apiFetching().get(
      `/lookup?lookup_group=business_category`
    );
    console.log("response.data: ", bc.data.lookup_data);

    BUSINESS_CATEGORY_OPTIONS.value = bc.data.lookup_data;
  } catch (error) {
    console.error("Fetch lookup error:", error);
  }
}

onMounted(async () => {
  await fetchLookup();
});
</script>
