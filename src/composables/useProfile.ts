import { ref, computed } from "vue";
import { useToast } from "@/composables/useToast";
import { UserProfile, UpdateProfileRequest } from "@/types/auth";
import { toast } from "vue-sonner";
import { apiFetching } from "@/services/api-fetching";

const profile = ref<UserProfile | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

export function useProfile() {
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);

  /**
   * Get user's access token from localStorage
   */
  const getAccessToken = (): string | null => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData.access_token;
    }
    return null;
  };

  /**
   * Make authenticated API request
   */
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ) => {
    const token = getAccessToken();

    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(`/api${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  };

  /**
   * Fetch user profile from API
   */
  const fetchProfile = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiFetching().get("/profile", true);
      profile.value = response.data;

      console.log(response.data);
    } catch (err: any) {
      toast.error(err.data.message);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (
    updateData: UpdateProfileRequest
  ): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiFetching().put("/profile", updateData, true);
      console.log("updateData:", updateData);

      profile.value = response.data;

      toast.success(response.message);

      return true;
    } catch (err: any) {
      toast.error(err.data.message);

      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update notification preferences
   */
  const updateNotificationPreferences = async (preferences: {
    email_notifications: boolean;
    sms_notifications: boolean;
  }): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      //   const response = await makeAuthenticatedRequest(
      //     "/profile/notifications",
      //     {
      //       method: "PUT",
      //       body: JSON.stringify(preferences),
      //     }
      //   );
      const response = await apiFetching().put(
        "/profile/notifications",
        preferences,
        true
      );

      toast.success(response.message);

      return true;
    } catch (err: any) {
      toast.error(err.data.message);

      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Upload profile avatar
   */
  const uploadAvatar = async (file: File): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const formData = new FormData();
      formData.append("avatar", file);

      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();

      showSuccessToast("Success", {
        description: result.message || "Avatar uploaded successfully",
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload avatar";
      error.value = errorMessage;
      console.error("Error uploading avatar:", err);

      showErrorToast("Error", {
        description: errorMessage,
      });

      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reset profile state
   */
  const resetProfile = (): void => {
    profile.value = null;
    error.value = null;
    loading.value = false;
  };

  return {
    // State
    profile: computed(() => profile.value),
    isLoading,
    hasError,
    error: computed(() => error.value),

    // Actions
    fetchProfile,
    updateProfile,
    updateNotificationPreferences,
    uploadAvatar,
    resetProfile,
  };
}
