import { ref, computed } from "vue";
// import { BusinessService } from '@/services/business'; // Commented out for mock data
import { useToast } from "@/composables/useToast";
import type {
  Business,
  BusinessFormData,
  BusinessValidationErrors,
} from "@/types/business";

// Helper function to simulate API delay
const simulateApiCall = (delay: number = 800) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export function useBusiness() {
  // State
  const businesses = ref<Business[]>([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | undefined>(undefined);

  // Toast notifications
  const toast = useToast();

  // Computed
  const hasBusinesses = computed(() => businesses.value.length > 0);
  const businessesCount = computed(() => businesses.value.length);

  // Validation functions
  const validateBusinessForm = (
    formData: BusinessFormData
  ): BusinessValidationErrors => {
    const errors: BusinessValidationErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      errors.name = "Company name is required";
    }

    if (!formData.ssm.trim()) {
      errors.ssm = "SSM number is required";
    } else if (!/^\d{12}$/.test(formData.ssm.replace(/[-\s]/g, ""))) {
      errors.ssm = "Invalid SSM number format (12 digits required)";
    }

    if (!formData.address.trim()) {
      errors.address = "Business address is required";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (
      !/^(\+?60|0)[0-9-\s]{8,12}$/.test(formData.phone.replace(/[-\s]/g, ""))
    ) {
      errors.phone = "Invalid phone number format";
    }

    if (!formData.type) {
      errors.type = "Business type is required";
    }

    if (!formData.sector) {
      errors.sector = "Business sector is required";
    }

    if (!formData.category) {
      errors.category = "Business category is required";
    }

    // MOF Registration Number validation
    if (formData.mofRegistration && !formData.mofRegistrationNumber?.trim()) {
      errors.mofRegistrationNumber = "MOF Registration Number is required when MOF Registration is selected";
    }

    // Optional URL validation
    if (formData.url && formData.url.trim()) {
      const urlPattern = /^https?:\/\/.+\..+/;
      if (!urlPattern.test(formData.url)) {
        errors.url = "Invalid URL format";
      }
    }

    return errors;
  };

  // Mock API functions
  const fetchBusinesses = async () => {
    try {
      isLoading.value = true;
      error.value = undefined;

      // Simulate API call delay
      await simulateApiCall();

      // Load mock data
      businesses.value = [];
    } catch (err: any) {
      const errorMessage =
        err.message || "Ralat semasa mengambil data perniagaan";
      error.value = errorMessage;
      toast.error("Ralat", {
        description: errorMessage,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const createBusiness = async (
    formData: BusinessFormData
  ): Promise<boolean> => {
    try {
      isSubmitting.value = true;
      error.value = undefined;

      // Validate form
      const validationErrors = validateBusinessForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0];
        toast.error("Ralat Validasi", {
          description: firstError,
        });
        return false;
      }

      // Simulate API call delay
      await simulateApiCall(1200);

      // Create new business object
      const newBusiness: Business = {
        id: Date.now().toString(), // Simple ID generation for mock
        name: formData.name.trim(),
        ssm: formData.ssm.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        type: formData.type as any,
        sector: formData.sector as any,
        category: formData.category as any,
        mofRegistration: formData.mofRegistration,
        mofRegistrationNumber: formData.mofRegistrationNumber?.trim() || "",
        ...(formData.url?.trim() ? { url: formData.url.trim() } : {}),
        createdAt: new Date(),
      };

      // Add new business to list
      businesses.value.push(newBusiness);

      toast.success("Berjaya", {
        description: "Perniagaan baru telah didaftarkan",
      });

      return true;
    } catch (err: any) {
      const errorMessage =
        err.message || "Ralat semasa mendaftarkan perniagaan";
      error.value = errorMessage;
      toast.error("Ralat", {
        description: errorMessage,
      });
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  const updateBusiness = async (
    id: string,
    formData: Partial<BusinessFormData>
  ): Promise<boolean> => {
    try {
      isSubmitting.value = true;
      error.value = undefined;

      // Simulate API call delay
      await simulateApiCall(1000);

      // Find and update business in list
      const index = businesses.value.findIndex((b) => b.id === id);
      if (index !== -1) {
        const updatedBusiness: Business = {
          ...businesses.value[index],
          ...Object.fromEntries(
            Object.entries(formData).filter(([_, value]) => value !== undefined)
          ),
          updatedAt: new Date(),
        };
        businesses.value[index] = updatedBusiness;
      }

      toast.success("Berjaya", {
        description: "Maklumat perniagaan telah dikemaskini",
      });

      return true;
    } catch (err: any) {
      error.value = err.message || "Ralat semasa mengemaskini perniagaan";
      toast.error("Ralat", {
        description: error.value || "Ralat semasa mengemaskini perniagaan",
      });
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  const deleteBusiness = async (id: string): Promise<boolean> => {
    try {
      isSubmitting.value = true;
      error.value = undefined;

      // Simulate API call delay
      await simulateApiCall(600);

      // Remove business from list
      businesses.value = businesses.value.filter((b) => b.id !== id);

      toast.success("Berjaya", {
        description: "Perniagaan telah dipadam",
      });

      return true;
    } catch (err: any) {
      error.value = err.message || "Ralat semasa memadam perniagaan";
      toast.error("Ralat", {
        description: error.value || "Ralat semasa memadam perniagaan",
      });
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  // Utility functions
  const createEmptyFormData = (): BusinessFormData => ({
    name: "",
    ssm: "",
    address: "",
    phone: "",
    type: "",
    sector: "",
    category: "",
    mofRegistration: false,
    mofRegistrationNumber: "",
    url: "",
  });

  const businessToFormData = (business: Business): BusinessFormData => ({
    name: business.name,
    ssm: business.ssm,
    address: business.address,
    phone: business.phone,
    type: business.type,
    sector: business.sector,
    category: business.category,
    mofRegistration: business.mofRegistration,
    mofRegistrationNumber: business.mofRegistrationNumber || "",
    url: business.url || "",
  });

  return {
    // State
    businesses,
    isLoading,
    isSubmitting,
    error,

    // Computed
    hasBusinesses,
    businessesCount,

    // Actions
    fetchBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,

    // Validation
    validateBusinessForm,

    // Utilities
    createEmptyFormData,
    businessToFormData,
  };
}
