/**
 * Configuration store for managing application-wide settings
 */
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { configService } from '@/services/config';

/**
 * Configuration store
 * Manages all application configuration settings and provides CRUD operations
 */
export const useConfigStore = defineStore('config', () => {
  // Basic configuration state
  const config = ref({
    environment: configService.environment,
    api: configService.api,
    features: configService.features,
    analytics: configService.analytics,
  });

  // Loading state
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed getters
  const isDevelopment = computed(() => config.value.environment === 'development');
  const isProduction = computed(() => config.value.environment === 'production');
  const apiUrl = computed(() => config.value.api.url);

  // Basic methods
  async function loadConfig() {
    try {
      isLoading.value = true;
      error.value = null;
      
      // In a real app, this would load from an API
      // For frontend-only, we use the service defaults
      config.value = {
        environment: configService.environment,
        api: configService.api,
        features: configService.features,
        analytics: configService.analytics,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load config';
    } finally {
      isLoading.value = false;
    }
  }

  async function updateFeature(featureName: string, enabled: boolean) {
    try {
      config.value.features[featureName] = enabled;
      // In a real app, this would save to an API
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update feature';
    }
  }

  // Initialize on store creation
  loadConfig();

  return {
    config,
    isLoading,
    error,
    isDevelopment,
    isProduction,
    apiUrl,
    loadConfig,
    updateFeature,
  };
}); 