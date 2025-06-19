<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "vue-sonner";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref(route.query.email as string || "");
const otp = ref(route.query.otp as string || "");
const fullName = ref("");
const icNumber = ref("");
const address = ref("");
const selectedState = ref("");
const isSubmitting = ref(false);
const isLoading = ref(true);

// Malaysian states
const states = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Wilayah Persekutuan Kuala Lumpur",
  "Wilayah Persekutuan Labuan",
  "Wilayah Persekutuan Putrajaya"
];

// Form validation
const isFormValid = computed(() => {
  return (
    fullName.value.trim() !== "" &&
    icNumber.value.trim() !== "" && 
    icNumber.value.length >= 12 &&
    address.value.trim() !== "" &&
    selectedState.value !== ""
  );
});

// Check if the user is already authenticated on component mount
onMounted(() => {
  // Short delay to ensure auth store is initialized
  setTimeout(() => {
    if (authStore.isAuthenticated) {
      console.log("User already authenticated, redirecting to appropriate dashboard");
      redirectToDashboard();
    }
    
    if (!email.value || !otp.value) {
      router.replace('/login');
      toast.error("Please complete the verification process first");
    }
    
    isLoading.value = false;
  }, 300);
});

// Utility function to redirect based on user role
function redirectToDashboard() {
  const userRole = authStore.user?.user_type;
  
  switch (userRole) {
    case "superadmin":
      router.replace("/superadmin/home");
      break;
    case "admin":
      router.replace("/admin/home");
      break;
    case "manager":
      router.replace("/manager/home");
      break;
    case "user":
      router.replace("/user/home");
      break;
    default:
      // Stay on login page if role is unknown
      break;
  }
}

// Handle registration form submission
async function handleSubmit() {
  if (!isFormValid.value) {
    toast.error("Please fill in all required fields");
    return;
  }

  try {
    isSubmitting.value = true;
    
    // For prototype, we'll simulate a registration success
    console.log("Registration form submitted:", {
      email: email.value,
      fullName: fullName.value,
      icNumber: icNumber.value,
      address: address.value,
      state: selectedState.value
    });
    
    // In a real app, we would call the API to register the user
    // await authStore.register({...});
    
    // Redirect to success page
    router.push('/register/success');
  } catch (error: any) {
    console.error("Registration error:", error);
    toast.error(error.message || "Registration failed");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center h-full">
    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
  </div>
  
  <div v-else>
    <div class="flex flex-col space-y-2 text-center">
      <h1 class="text-2xl font-semibold tracking-tight">
        Complete Your Registration
      </h1>
      <p class="text-sm text-muted-foreground">
        Please provide the following information to join DPIM
      </p>
    </div>

    <Card>
      <CardContent class="pt-4">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              disabled
              readonly
            />
          </div>
          
          <div class="space-y-2">
            <Label for="fullName">Full Name</Label>
            <Input
              id="fullName"
              v-model="fullName"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div class="space-y-2">
            <Label for="icNumber">IC Number</Label>
            <Input
              id="icNumber"
              v-model="icNumber"
              type="text"
              placeholder="e.g. 880101011234"
              required
            />
          </div>
          
          <div class="space-y-2">
            <Label for="address">Address</Label>
            <Textarea
              id="address"
              v-model="address"
              placeholder="Enter your full address"
              required
              rows="3"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="state">State</Label>
            <Select v-model="selectedState">
              <SelectTrigger>
                <SelectValue placeholder="Select state to join" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="state in states" :key="state" :value="state">
                    {{ state }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            type="submit"
            class="w-full"
            :disabled="isSubmitting || !isFormValid"
          >
            <span v-if="isSubmitting">
              <svg
                class="animate-spin mr-2 h-4 w-4 text-primary-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Registering...
            </span>
            <span v-else>Submit Application</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template> 