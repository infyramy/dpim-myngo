<script setup lang="ts">
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const router = useRouter();

function goToLogin() {
  router.push('/login');
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-8 w-8 text-green-600 dark:text-green-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <h1 class="text-3xl font-bold tracking-tight">
        Registration Successful!
      </h1>
      <p class="text-sm text-muted-foreground">
        Your application has been submitted and is pending approval
      </p>
    </div>

    <!-- Success Card -->
    <Card>
      <CardHeader class="space-y-1 pb-4">
        <h2 class="text-xl font-semibold text-center">
          What happens next?
        </h2>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
          <ul class="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <li class="flex items-start">
              <svg class="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Your application will be reviewed by the state administrator
            </li>
            <li class="flex items-start">
              <svg class="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              You'll receive an email notification once it's approved
            </li>
            <li class="flex items-start">
              <svg class="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              After approval, you'll gain full access to all member features
            </li>
            <li class="flex items-start">
              <svg class="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              The approval process typically takes 1-2 business days
            </li>
          </ul>
        </div>
        
        <Button @click="goToLogin" class="w-full h-11 font-medium">
          Return to Login
        </Button>
      </CardContent>
    </Card>

    <!-- Footer Note -->
    <div class="text-center pt-4">
      <p class="text-xs text-muted-foreground">
        You can check your application status by logging in with your email
      </p>
    </div>
  </div>
</template> 