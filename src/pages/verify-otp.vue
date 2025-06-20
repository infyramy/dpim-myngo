<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  PinInput,
  PinInputGroup,
  PinInputSlot,
} from "@/components/ui/pin-input";
import { toast } from "vue-sonner";
import { apiFetching } from "@/services/api-fetching";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref((route.query.email as string) || "");
const otp = ref<string[]>([]);
const isSubmitting = ref(false);
const isLoading = ref(true);
const resendCountdown = ref(0);

// Format the remaining resend time
const formattedResendTime = computed(() => {
  const minutes = Math.floor(resendCountdown.value / 60);
  const seconds = resendCountdown.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

// Check if the user is already authenticated on component mount
onMounted(async () => {
  // Initialize resend countdown
  startResendCountdown();

  try {
    // Wait for auth store to be fully initialized
    while (!authStore.isInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Check if user is already authenticated
    if (authStore.isAuthenticated) {
      console.log(
        "User already authenticated, redirecting to appropriate dashboard"
      );
      redirectToDashboard();
      return; // Don't set isLoading to false if redirecting
    }

    // Check if email is provided
    if (!email.value) {
      await router.replace("/login");
      toast.error("Please enter your email first");
      return; // Don't set isLoading to false if redirecting
    }

    // If we reach here, show the form
    isLoading.value = false;
  } catch (error) {
    console.error("Error during initialization:", error);
    // Even if there's an error, show the form
    isLoading.value = false;
  }
});

// Start countdown for resend button
function startResendCountdown() {
  resendCountdown.value = 60; // 1 minute countdown
  const timer = setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value -= 1;
    } else {
      clearInterval(timer);
    }
  }, 1000);
}

// Utility function to redirect based on user role
function redirectToDashboard() {
  const userRole = authStore.getUser().user_type;

  switch (userRole) {
    case "superadmin":
      router.push("/superadmin/dashboard");
      break;
    case "admin":
      router.push("/admin/dashboard");
      break;
    case "operator":
      router.push("/operator/dashboard");
      break;
    case "user":
      router.push("/user/dashboard");
      break;
    default:
      // If role is unknown, redirect to login and clear auth
      console.warn("Unknown user role:", userRole);
      authStore.logoutUser();
      router.push("/login");
      break;
  }
}

// Handle OTP verification submission
async function verifyOtp() {
  const otpValue = otp.value.join("");

  if (otpValue.length !== 6) {
    toast.error("Please enter all 6 digits");
    return;
  }

  try {
    isSubmitting.value = true;

    // Existing user login
    let response = await apiFetching().post("/auth/verify-otp", {
      email: email.value,
      otp: otpValue,
    });

    // Set authstore
    authStore.setUser(response.data);

    // Set operator stores
    if (response.data.user.user_role === "operator") {
      authStore.setOperatorStates(response.data.operator_states);
    }

    setTimeout(() => {
      toast.success("Verification code verified");

      // Get the redirect path from query parameters or use role-based default
      const redirectPath = route.query.redirect as string;
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        redirectToDashboard();
      }
    }, 1000);
  } catch (error: any) {
    console.error("OTP verification error:", error);
    toast.error(error.message || "Invalid verification code");

    isSubmitting.value = false;
  }
}

// Resend OTP code
async function resendOtp() {
  if (resendCountdown.value > 0) return;

  try {
    await authStore.sendOtp(email.value);
    toast.success("Verification code resent");
    startResendCountdown();
  } catch (error: any) {
    console.error("Failed to resend OTP:", error);
    toast.error(error.message || "Failed to resend verification code");
  }
}

// Handle pin input completion
function handleComplete(value: string[]) {
  otp.value = value;
  if (value.length === 6 && value.every((v) => v.length === 1)) {
    // Auto-submit when all 6 digits are entered
    verifyOtp();
  }
}

// Handle pin input change
function handleChange(value: string[]) {
  otp.value = value;
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="flex items-center justify-center py-12">
    <div
      class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
    ></div>
  </div>

  <!-- OTP Verification Form -->
  <div v-else class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Verify Your Email</h1>
      <p class="text-sm text-muted-foreground">
        Enter the 6-digit code sent to
        <span class="font-medium">{{ email }}</span>
      </p>
    </div>

    <!-- Verification Card -->
    <Card>
      <CardHeader class="space-y-1 pb-4">
        <h2 class="text-xl font-semibold text-center">
          Enter verification code
        </h2>
      </CardHeader>
      <CardContent class="space-y-6">
        <form @submit.prevent="verifyOtp" class="space-y-6">
          <div class="space-y-3">
            <Label class="text-sm font-medium">Verification Code</Label>
            <div class="flex justify-center">
              <PinInput
                v-model="otp"
                :length="6"
                type="text"
                otp
                class="gap-3"
                @update:model-value="handleChange"
                @complete="handleComplete"
              >
                <PinInputGroup>
                  <PinInputSlot
                    v-for="(id, index) in 6"
                    :key="id"
                    :index="index"
                    class="h-12 w-12 text-lg font-medium bg-background"
                  />
                </PinInputGroup>
              </PinInput>
            </div>
          </div>

          <Button
            type="submit"
            class="w-full h-11 font-medium"
            :disabled="isSubmitting || otp.join('').length !== 6"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center">
              <svg
                class="animate-spin mr-2 h-4 w-4"
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
              Verifying...
            </span>
            <span v-else>Verify & Continue</span>
          </Button>
        </form>

        <!-- Resend Section -->
        <div class="text-center pt-4 border-t">
          <p class="text-sm text-muted-foreground mb-3">
            Didn't receive a code?
          </p>
          <Button
            type="button"
            variant="ghost"
            class="h-10 font-medium"
            :disabled="resendCountdown > 0"
            @click="resendOtp"
          >
            <span v-if="resendCountdown > 0">
              Resend in {{ formattedResendTime }}
            </span>
            <span v-else> Resend code </span>
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Back to Login -->
    <div class="text-center">
      <p class="text-sm text-muted-foreground">
        Want to use a different email?
        <router-link
          to="/login"
          class="font-medium text-primary hover:text-primary/90 underline underline-offset-4"
        >
          Back to login
        </router-link>
      </p>
    </div>
  </div>
</template>
