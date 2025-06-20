<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BirthDatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "vue-sonner";
import { Badge } from "@/components/ui/badge";
import { apiFetching } from "@/services/api-fetching";

// State interface
interface State {
  title: string;
  code: string;
  flag: string;
}

// Malaysian States Data with flags
const malaysianStates = ref<State[]>([]);

const router = useRouter();

// Step management
const currentStep = ref(1);
const totalSteps = 2;

// Step 1: State Selection
const selectedState = ref("");

// Step 2: Registration Form Data
const formData = ref({
  email: "",
  mykadNumber: "",
  fullName: "",
  mobilePhone: "",
  gender: "",
  spouseName: "",
  dateOfBirth: "" as string,
  relationshipWithSpouse: "",
  residentialAddress: "",
  spouseMobilePhone: "",
  address1: "",
  address2: "",
  postcode: "",
  city: "",
  socialMedia: [] as string[],
});

const newSocialMedia = ref("");
const isSubmitting = ref(false);
const errors = ref<Record<string, string>>({});

const canProceedToStep2 = computed(() => selectedState.value !== "");

const isFormValid = computed(() => {
  const required = [
    "email",
    "mykadNumber",
    "fullName",
    "mobilePhone",
    "gender",
    "residentialAddress",
    "postcode",
    "city",
  ];

  const hasAllFields =
    required.every(
      (field) => formData.value[field as keyof typeof formData.value] !== ""
    ) &&
    formData.value.dateOfBirth !== "" &&
    selectedState.value !== "";

  const hasValidEmail = validateEmail(formData.value.email);
  const hasValidMykad = validateMykadNumber(formData.value.mykadNumber);
  const hasValidPhone = validatePhone(formData.value.mobilePhone);

  return hasAllFields && hasValidEmail && hasValidMykad && hasValidPhone;
});

// Methods
function nextStep() {
  if (currentStep.value === 1 && canProceedToStep2.value) {
    currentStep.value = 2;

    scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value = currentStep.value - 1;

    scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

function selectState(state: string) {
  selectedState.value = state;
}

function addSocialMedia() {
  if (
    newSocialMedia.value.trim() &&
    !formData.value.socialMedia.includes(newSocialMedia.value.trim())
  ) {
    formData.value.socialMedia.push(newSocialMedia.value.trim());
    newSocialMedia.value = "";
  }
}

function removeSocialMedia(index: number) {
  formData.value.socialMedia.splice(index, 1);
}

function handleMykadInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const formatted = formatMykadNumber(target.value);
  formData.value.mykadNumber = formatted;
}

async function handleSubmit() {
  if (!isFormValid.value) {
    toast.error("Please fill in all required fields correctly");
    return;
  }

  try {
    isSubmitting.value = true;

    const registrationData = {
      state: selectedState.value,
      ...formData.value,
      mykadNumber: cleanMykadNumber(formData.value.mykadNumber), // Remove dashes for API
      mobilePhone: formatPhoneForApi(formData.value.mobilePhone), // Format phone with +60 prefix
      spouseMobilePhone: formData.value.spouseMobilePhone 
        ? formatPhoneForApi(formData.value.spouseMobilePhone) 
        : "", // Format spouse phone if provided
    };

    // Make API call to register endpoint
    await apiFetching().post("/auth/register", registrationData);

    setTimeout(() => {
      toast.success("Registration successful!");
      router.push("/register-success");
    }, 1500);
  } catch (error: any) {
    console.error("Registration error:", error);
    toast.error(error.data.message || "Registration failed. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}

function formatMykadNumber(value: string) {
  // Remove all non-digit characters
  const cleanValue = value.replace(/\D/g, "");

  // Limit to 12 digits
  const limitedValue = cleanValue.substring(0, 12);

  // Add dashes at appropriate positions: YYMMDD-PB-XXXG
  let formatted = limitedValue;
  if (limitedValue.length > 6) {
    formatted = limitedValue.substring(0, 6) + "-" + limitedValue.substring(6);
  }
  if (limitedValue.length > 8) {
    formatted =
      limitedValue.substring(0, 6) +
      "-" +
      limitedValue.substring(6, 8) +
      "-" +
      limitedValue.substring(8);
  }

  return formatted;
}

function cleanMykadNumber(mykad: string) {
  // Remove dashes for API submission
  return mykad.replace(/-/g, "");
}

function validateMykadNumber(mykad: string) {
  // Clean the MyKad number first
  const cleanMykad = cleanMykadNumber(mykad);
  // Validate it has exactly 12 digits
  return /^\d{12}$/.test(cleanMykad);
}

function validateEmail(email: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function validatePhone(phone: string) {
  // Malaysian phone number validation
  // Mobile: 01X-XXXXXXX or 1X-XXXXXXX (without country code +60)
  const cleanPhone = phone.replace(/[\s-]/g, "");
  const phonePattern = /^(01[0-9]|1[0-9])[0-9]{7,8}$/;
  return phonePattern.test(cleanPhone);
}

function formatPhoneForApi(phone: string) {
  // Clean the phone number by removing spaces and dashes
  let cleanPhone = phone.replace(/[\s-]/g, "");
  
  // If phone starts with 0, remove it (since +60 already includes the country code)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Add +60 prefix
  return `+60${cleanPhone}`;
}

function validateField(field: string, value: string) {
  errors.value[field] = "";

  switch (field) {
    case "email":
      if (!value) {
        errors.value[field] = "Email is required";
      } else if (!validateEmail(value)) {
        errors.value[field] = "Please enter a valid email address";
      }
      break;
    case "mykadNumber":
      if (!value) {
        errors.value[field] = "MyKad number is required";
      } else if (!validateMykadNumber(value)) {
        errors.value[field] = "Please enter a valid MyKad number (12 digits)";
      }
      break;
    case "mobilePhone":
      if (!value) {
        errors.value[field] = "Mobile phone is required";
      } else if (!validatePhone(value)) {
        errors.value[field] =
          "Please enter a valid Malaysian phone number (e.g., 012-3456789 or 12-3456789)";
      }
      break;
    default:
      if (!value) {
        errors.value[field] = "This field is required";
      }
  }
}

async function fetchStates() {
  try {
    const response = await apiFetching().get("/states");
    console.log(response.data.states);

    malaysianStates.value = response.data.states;
  } catch (error) {
    console.error("States error:", error);
  }
}

onMounted(async () => {
  await fetchStates();
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="space-y-8 max-w-2xl w-full">
      <!-- Header -->
      <div class="text-center space-y-3">
        <div class="flex items-center justify-center gap-2 mt-4">
          <img
            src="https://www.dpim.org.my/wp-content/uploads/2024/02/Logo-DPIM.png"
            alt="logo"
            class="h-20 w-auto bg-foreground rounded-lg"
          />
        </div>

        <h1 class="text-2xl font-semibold">Create Account</h1>
        <p class="text-muted-foreground">
          Step {{ currentStep }} of {{ totalSteps }}
        </p>
      </div>

      <!-- Step 1: State Selection -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div class="space-y-4">
          <h2 class="text-lg font-medium text-center">Select Your State</h2>
          <div class="grid grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="state in malaysianStates"
              :key="state.code"
              class="cursor-pointer"
              @click="selectState(state.code)"
            >
              <div
                class="border rounded-lg p-2 transition-all hover:border-primary"
                :class="
                  selectedState === state.title
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                "
              >
                <div class="aspect-rectangle mb-2">
                  <img
                    :src="state.flag"
                    :alt="`${state.title} flag`"
                    class="w-full h-full object-cover rounded"
                  />
                </div>
                <p class="text-xs text-center truncate">
                  {{ state.title }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="selectedState"
            class="text-center text-sm text-muted-foreground"
          >
            Selected: {{ selectedState }}
          </div>
        </div>

        <div class="flex justify-end">
          <Button @click="nextStep" :disabled="!canProceedToStep2">
            Continue
          </Button>
        </div>
      </div>

      <!-- Step 2: Registration Details -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="space-y-4">
          <h2 class="text-lg font-medium text-center">Your Details</h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                v-model="formData.email"
                placeholder="your@email.com"
                required
                @blur="validateField('email', formData.email)"
              />
              <p v-if="errors.email" class="text-sm text-red-500">
                {{ errors.email }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="fullName">Full Name</Label>
              <Input
                id="fullName"
                v-model="formData.fullName"
                placeholder="Your full name"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="mykadNumber">MyKad Number</Label>
              <Input
                id="mykadNumber"
                v-model="formData.mykadNumber"
                placeholder="Enter 12 digits (e.g., 991231081234)"
                required
                @input="handleMykadInput"
                @blur="validateField('mykadNumber', formData.mykadNumber)"
                maxlength="14"
              />
              <p v-if="errors.mykadNumber" class="text-sm text-red-500">
                {{ errors.mykadNumber }}
              </p>
              <!-- <p class="text-xs text-muted-foreground">
              Format: YYMMDD-PB-XXXG (dashes will be added automatically)
            </p> -->
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="mobilePhone">Mobile Phone</Label>
                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    +60
                  </span>
                  <Input
                    id="mobilePhone"
                    type="tel"
                    v-model="formData.mobilePhone"
                    placeholder="12-3456789 or 012-3456789"
                    class="pl-12"
                    required
                    @blur="validateField('mobilePhone', formData.mobilePhone)"
                  />
                </div>
                <p v-if="errors.mobilePhone" class="text-sm text-red-500">
                  {{ errors.mobilePhone }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="gender">Gender</Label>
                <Select v-model="formData.gender" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="dateOfBirth">Date of Birth</Label>
              <BirthDatePicker
                v-model="formData.dateOfBirth"
                placeholder="Select your birth date"
              />
            </div>

            <div class="space-y-2">
              <Label for="residentialAddress">Address</Label>
              <Textarea
                id="residentialAddress"
                v-model="formData.residentialAddress"
                placeholder="Your address"
                required
                rows="2"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  v-model="formData.postcode"
                  placeholder="12345"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="city">City</Label>
                <Input
                  id="city"
                  v-model="formData.city"
                  placeholder="Your city"
                  required
                />
              </div>
            </div>

            <!-- Optional Fields -->
            <details class="pt-4">
              <summary
                class="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              >
                Optional Information
              </summary>
              <div class="space-y-4 pt-4">
                <div class="space-y-2">
                  <Label for="spouseName">Next of Kin Name</Label>
                  <Input
                    id="spouseName"
                    v-model="formData.spouseName"
                    placeholder="Name"
                  />
                </div>

                <div class="space-y-2">
                  <Label for="spouseMobilePhone">Next of Kin Phone</Label>
                  <div class="relative">
                    <span
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      +60
                    </span>
                    <Input
                      id="spouseMobilePhone"
                      type="tel"
                      v-model="formData.spouseMobilePhone"
                      placeholder="12-3456789 or 012-3456789"
                      class="pl-12"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="newSocialMedia">Social Media</Label>
                  <div class="flex gap-2">
                    <Input
                      id="newSocialMedia"
                      v-model="newSocialMedia"
                      type="url"
                      placeholder="https://..."
                      @keyup.enter="addSocialMedia"
                    />
                    <Button
                      type="button"
                      @click="addSocialMedia"
                      variant="outline"
                      size="sm"
                      :disabled="!newSocialMedia.trim()"
                    >
                      Add
                    </Button>
                  </div>
                  <div
                    v-if="formData.socialMedia.length > 0"
                    class="flex flex-wrap gap-2"
                  >
                    <Badge
                      v-for="(social, index) in formData.socialMedia"
                      :key="index"
                      variant="secondary"
                      class="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      @click="removeSocialMedia(index)"
                    >
                      {{
                        social.length > 25
                          ? social.substring(0, 25) + "..."
                          : social
                      }}
                      ×
                    </Badge>
                  </div>
                </div>
              </div>
            </details>
          </form>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between">
          <Button variant="outline" @click="prevStep"> Back </Button>
          <Button @click="handleSubmit" :disabled="isSubmitting">
            {{ isSubmitting ? "Creating..." : "Create Account" }}
          </Button>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center text-sm text-muted-foreground">
        <span>Already have an account? </span>
        <router-link to="/login" class="text-primary hover:underline">
          Sign in
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations for smooth transitions */
.step-transition-enter-active,
.step-transition-leave-active {
  transition: all 0.3s ease-in-out;
}

.step-transition-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.step-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
