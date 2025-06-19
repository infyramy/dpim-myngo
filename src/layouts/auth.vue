<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import { useRouter } from "vue-router";

// Initialize color mode
const mode = useColorMode();
const router = useRouter();

function toggleMode() {
  mode.value = mode.value === "dark" ? "light" : "dark";
}

function navigateTo(path: string) {
  router.push(path);
}

let animationId: number | null = null;

function updateMousePosition(event: MouseEvent) {
  if (animationId) return; // Throttle updates

  const container = event.currentTarget as HTMLElement;
  if (!container) return; // Safety check

  animationId = requestAnimationFrame(() => {
    try {
      const rect = container.getBoundingClientRect();
      // More precise calculation to center the cursor exactly
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);
      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);
    } catch (error) {
      console.warn("Easter egg position update failed:", error);
    } finally {
      animationId = null;
    }
  });
}

function resetPosition(event: MouseEvent) {
  const container = event.currentTarget as HTMLElement;
  if (!container) return; // Safety check

  try {
    // Hide completely by moving reveal point far outside the container
    container.style.setProperty("--mouse-x", "-999px");
    container.style.setProperty("--mouse-y", "-999px");
  } catch (error) {
    console.warn("Easter egg reset failed:", error);
  }
}
</script>

<template>
  <div class="min-h-svh">
    <div
      class="container relative min-h-svh flex flex-col items-center justify-center px-4 md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
    >
      <!-- Theme Toggle Button -->
      <button
        @click="toggleMode"
        class="fixed right-4 top-4 z-50 rounded-lg p-2 hover:bg-muted"
        aria-label="Toggle theme"
      >
        <svg
          v-if="mode === 'dark'"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-6 w-6 text-yellow-300"
        >
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-6 w-6 text-slate-700"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      </button>

      <!-- Left: Logo & Image -->
      <div
        class="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex"
      >
        <div class="absolute inset-0 bg-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Authentication"
            class="h-full w-full object-cover opacity-30"
          />
        </div>
        <div class="relative z-20 flex items-center text-lg font-medium">
          <img
            src="https://www.dpim.org.my/wp-content/uploads/2024/02/Logo-DPIM.png"
            alt="logo"
            class="h-16 w-auto rounded-lg bg-foreground"
          />
        </div>
        <div class="relative z-20 mt-auto">
          <div class="space-y-2">
            <h1
              class="text-3xl md:text-4xl font-bold tracking-tight text-white italic"
            >
              DPIM
            </h1>
            <p class="text-slate-300">
              Empowering Digital Transformation Through Innovation
            </p>
          </div>
        </div>
      </div>

      <!-- Right: Auth Content -->
      <div class="py-6 lg:p-8">
        <div
          class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
        >
          <slot />

          <!-- Footer with links -->
          <div class="mt-8 text-center text-sm text-muted-foreground">
            <!-- <div class="flex justify-center space-x-4">
              <button
                @click="navigateTo('/about')"
                class="hover:text-primary transition-colors"
              >
                About Us
              </button>
              <span class="text-muted-foreground/50">|</span>
              <button
                @click="navigateTo('/privacy-policy')"
                class="hover:text-primary transition-colors"
              >
                Privacy
              </button>
              <span class="text-muted-foreground/50">|</span>
              <button
                @click="navigateTo('/terms-of-service')"
                class="hover:text-primary transition-colors"
              >
                Terms
              </button>
            </div> -->

            <!-- Footer wording -->
            <div
              class="mt-2 text-xs cursor-default select-none relative overflow-hidden easter-egg-container"
              @mousemove="updateMousePosition"
              @mouseleave="resetPosition"
            >
              <span class="easter-egg-text"
                >هذا الموقع غير مدفوع! يرجى الدفع أولاً! | Ce site n'est pas
                payé! Veuillez payer d'abord! |
                このサイトは未払いです！先に支払ってください！

                <div class="flex gap-2 items-center justify-center">
                  <img
                    src="data:image/jpeg;base64,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"
                    alt=""
                    class="w-10 h-10"
                  />

                  <img
                    src="data:image/jpeg;base64,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"
                    alt=""
                    class="w-10 h-10"
                  />

                  <img
                    src="https://media.licdn.com/dms/image/v2/C4D03AQGW4VhlK9tkgA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1636450353679?e=2147483647&v=beta&t=xcEusHTknz8ioSgakZfOkLXjrRjMlJtMcuTF21c6p3c"
                    alt=""
                    class="w-10 h-10"
                  />
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.easter-egg-container {
  --mouse-x: -999px;
  --mouse-y: -999px;
}

.easter-egg-text {
  color: transparent;
  position: relative;
  display: inline-block;
  background-color: hsl(var(--muted-foreground));
  background-clip: text;
  -webkit-background-clip: text;
  mask-image: radial-gradient(
    circle at var(--mouse-x) var(--mouse-y),
    black 12px,
    transparent 35px
  );
  -webkit-mask-image: radial-gradient(
    circle at var(--mouse-x) var(--mouse-y),
    black 12px,
    transparent 35px
  );
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
  transition: all 0.08s ease-out;
  -webkit-transition: all 0.08s ease-out;
  will-change: mask-image;
  transform: translateZ(0); /* Force GPU acceleration */
}

/* Ensure complete invisibility when not hovering */
.easter-egg-container:not(:hover) .easter-egg-text {
  mask-image: radial-gradient(
    circle at -999px -999px,
    black 12px,
    transparent 35px
  );
  -webkit-mask-image: radial-gradient(
    circle at -999px -999px,
    black 12px,
    transparent 35px
  );
}
</style>
