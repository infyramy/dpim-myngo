<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "vue-sonner";
import { apiFetching } from "@/services/api-fetching";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const isSubmitting = ref(false);
const isLoading = ref(true);

// Check if the user is already authenticated on component mount
onMounted(async () => {
  try {
    // Check if user is already authenticated
    if (authStore.isAuthenticated) {
      redirectToDashboard();
      return; // Don't set isLoading to false if redirecting
    }

    // If we reach here, show the form
    isLoading.value = false;
    console.log("🔵 LOGIN: isLoading set to false");
  } catch (error) {
    console.error("🔴 LOGIN: Error during initialization:", error);
    // Even if there's an error, show the form
    isLoading.value = false;
  }
});

// Utility function to redirect based on user role
function redirectToDashboard() {
  const userRole = authStore.user?.user_type;

  switch (userRole) {
    case "superadmin":
      router.replace("/superadmin/dashboard");
      break;
    case "admin":
      router.replace("/admin/dashboard");
      break;
    case "operator":
      router.replace("/operator/dashboard");
      break;
    case "user":
      router.replace("/user/dashboard");
      break;
    default:
      // If role is unknown, redirect to login and clear auth
      console.warn("Unknown user role:", userRole);
      authStore.logoutUser();
      router.replace("/login");
      break;
  }
}

async function handleSubmit() {
  if (!email.value) {
    toast.error("Please enter your email address");
    return;
  }

  try {
    isSubmitting.value = true;

    // Send OTP to the user's email
    // await authStore.sendOtp(email.value);

    await apiFetching().post("/auth/send-otp", {
      email: email.value,
    });

    setTimeout(() => {
      toast.success("Verification code sent to your email");
      router.push(`/verify-otp?email=${email.value}`);
    }, 1000);
  } catch (error: any) {
    console.error("Login error:", error);
    toast.error(error.data.message || "Failed to send verification code");

    isSubmitting.value = false;
  }
}

// For prototype demonstration only
async function quickLoginAsUser() {
  try {
    isSubmitting.value = true;
    email.value = "user@example.com";
    await handleSubmit();
  } catch (error: any) {
    console.error("User login failed:", error);
    toast.error(error.message || "Login failed");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="flex items-center justify-center py-12">
    <div
      class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
    ></div>
  </div>

  <!-- Login Form -->
  <div v-else class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Welcome Back</h1>
      <p class="text-sm text-muted-foreground">
        Enter your email below to receive a verification code
      </p>
    </div>

    <!-- Login Card -->
    <Card>
      <CardHeader class="space-y-1 pb-4">
        <h2 class="text-xl font-semibold text-center">
          Sign in to your account
        </h2>
      </CardHeader>
      <CardContent class="space-y-4">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="h-11"
              required
              :disabled="isSubmitting"
            />
          </div>

          <Button
            type="submit"
            class="w-full h-11 font-medium"
            :disabled="isSubmitting"
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
              Sending...
            </span>
            <span v-else>Send Verification Code</span>
          </Button>
        </form>

        <!-- Register Link -->
        <div class="text-center pt-4">
          <p class="text-sm text-muted-foreground">
            Don't have an account?
            <router-link
              to="/register"
              class="font-medium text-primary hover:text-primary/90 underline underline-offset-4"
            >
              Create an account
            </router-link>
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
