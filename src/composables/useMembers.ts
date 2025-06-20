import { ref, computed } from "vue";
import { apiFetching } from "@/services/api-fetching";
import { toast } from "vue-sonner";

export interface Member {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  productsCount: number;
  businessesCount: number;
  joinDate: string;
  status: "active" | "pending" | "suspended";
  lastLogin?: string;
  businesses?: Business[];
  products?: Product[];
}

export interface Business {
  id: string;
  name: string;
  ssm: string;
  type: string;
  sector: string;
  category?: string;
  mofRegistration?: boolean;
  mofRegistrationNumber?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  businessName: string;
}

export interface MemberResponse {
  members: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MemberStatsResponse {
  stats: {
    total: number;
    active: number;
    suspended: number;
    inactive: number;
  };
  recentMembers: Array<{
    id: string;
    name: string;
    joinDate: string;
  }>;
}

export function useMembers() {
  // State
  const members = ref<Member[]>([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const memberStats = ref<MemberStatsResponse | null>(null);

  // Computed
  const hasMembers = computed(() => members.value.length > 0);
  const membersCount = computed(() => members.value.length);

  /**
   * Get all members with optional filtering and pagination
   */
  const fetchMembers = async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      isLoading.value = true;
      error.value = null;

      const api = apiFetching();
      const queryParams = new URLSearchParams();

      if (params?.search) queryParams.append("search", params.search);
      if (params?.status && params.status !== "all")
        queryParams.append("status", params.status);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `/members?${queryString}` : "/members";

      const response = await api.get(url, true);

      members.value = response.data.members;
      pagination.value = response.data.pagination;

      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.data?.message || err.message || "Failed to fetch members";
      error.value = errorMessage;
      toast.error("Error", errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get member by ID with detailed information
   */
  const fetchMemberById = async (id: string): Promise<Member> => {
    try {
      isLoading.value = true;
      error.value = null;

      const api = apiFetching();
      const response = await api.get(`/members/${id}`, true);

      return response.data.member;
    } catch (err: any) {
      const errorMessage =
        err.data?.message || err.message || "Failed to fetch member details";
      error.value = errorMessage;
      toast.error("Error", errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Suspend a member
   */
  const suspendMember = async (
    id: string,
    reason: string
  ): Promise<boolean> => {
    try {
      isSubmitting.value = true;
      error.value = null;

      if (!reason || !reason.trim()) {
        toast.error("Please provide a reason for suspension");
        return false;
      }

      const api = apiFetching();
      const response = await api.put(
        `/members/${id}/suspend`,
        { reason },
        true
      );

      toast.success("Member suspended successfully");
      return true;
    } catch (err: any) {
      const errorMessage =
        err.data?.message || err.message || "Failed to suspend member";
      error.value = errorMessage;
      toast.error("Error", errorMessage);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * Reactivate a suspended member
   */
  const reactivateMember = async (id: string): Promise<boolean> => {
    try {
      isSubmitting.value = true;
      error.value = null;

      const api = apiFetching();
      const response = await api.put(`/members/${id}/reactivate`, {}, true);

      toast.success("Member reactivated successfully");
      return true;
    } catch (err: any) {
      const errorMessage =
        err.data?.message || err.message || "Failed to reactivate member";
      error.value = errorMessage;
      toast.error("Error", errorMessage);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * Get member statistics
   */
  const fetchMemberStats = async (): Promise<MemberStatsResponse> => {
    try {
      isLoading.value = true;
      error.value = null;

      const api = apiFetching();
      const response = await api.get("/members/stats", true);

      memberStats.value = response.data;
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.data?.message || err.message || "Failed to fetch member statistics";
      error.value = errorMessage;
      toast.error("Error", errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Refresh members list - convenience method
   */
  const refreshMembers = async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    await fetchMembers(params);
  };

  /**
   * Reset pagination to first page
   */
  const resetPagination = () => {
    pagination.value.page = 1;
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Reset all state
   */
  const resetState = () => {
    members.value = [];
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    memberStats.value = null;
    error.value = null;
    isLoading.value = false;
    isSubmitting.value = false;
  };

  return {
    // State
    members,
    isLoading,
    isSubmitting,
    error,
    pagination,
    memberStats,

    // Computed
    hasMembers,
    membersCount,

    // Actions
    fetchMembers,
    fetchMemberById,
    suspendMember,
    reactivateMember,
    fetchMemberStats,
    refreshMembers,

    // Utilities
    resetPagination,
    clearError,
    resetState,
  };
}
