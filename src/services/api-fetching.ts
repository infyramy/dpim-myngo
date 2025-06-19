import { ofetch } from "ofetch";
import { useAuthStore } from "@/stores/auth";

const backendUrl = "http://localhost:3001";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const authStore = useAuthStore();
  const user = authStore.getUser();
  
  if (user?.access_token) {
    return {
      'Authorization': `Bearer ${user.access_token}`,
    };
  }
  
  return {};
};

// Helper function to handle response and check for new tokens
const handleResponse = (response: any) => {
  // Check for new access token in response headers
  if (response && response.headers) {
    const newAccessToken = response.headers.get('X-New-Access-Token');
    
    if (newAccessToken) {
      console.log("🔵 API: Received new access token, updating storage");
      
      // Update the stored access token
      const authStore = useAuthStore();
      const currentUser = authStore.getUser();
      
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          access_token: newAccessToken
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('access_token', newAccessToken);
        
        // Update store
        authStore.accessToken = newAccessToken;
      }
    }
  }
  
  return response;
};

// Helper function to handle errors
const handleError = (error: any) => {
  if (error.status === 401) {
    console.log("🔵 API: 401 error, clearing auth data");
    
    const authStore = useAuthStore();
    authStore.logoutUser();
    
    // Only redirect if we're not already on the login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  
  throw error;
};

export const apiFetching = () => {
  return {
    get: async (url: string, auth: boolean = false) => {
      console.log("API: GET", url);
      
      try {
        const response = await ofetch(`${backendUrl}${url}`, {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
          },
          credentials: 'include',
        });
        
        handleResponse(response);
        return response.json ? response.json() : response;
      } catch (error: any) {
        console.error("API: GET: Error: ", error);
        return handleError(error);
      }
    },
    
    post: async (url: string, data: any, auth: boolean = false) => {
      console.log("API: POST: ", url, data);
      
      try {
        const response = await ofetch(`${backendUrl}${url}`, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          credentials: 'include',
        });
        
        console.log("API: POST: Response: ", response);
        handleResponse(response);
        return response;
      } catch (error: any) {
        console.error("API: POST: Error: ", error);
        return handleError(error);
      }
    },
    
    put: async (url: string, data: any, auth: boolean = false) => {
      console.log("API: PUT: ", url, data);
      
      try {
        const response = await ofetch(`${backendUrl}${url}`, {
          method: 'PUT',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          credentials: 'include',
        });
        
        console.log("API: PUT: Response: ", response);
        handleResponse(response);
        return response;
      } catch (error: any) {
        console.error("API: PUT: Error: ", error);
        return handleError(error);
      }
    },
    
    delete: async (url: string, auth: boolean = false) => {
      console.log("API: DELETE: ", url);
      
      try {
        const response = await ofetch(`${backendUrl}${url}`, {
          method: 'DELETE',
          headers: {
            ...getAuthHeaders(),
          },
          credentials: 'include',
        });
        
        console.log("API: DELETE: Response: ", response);
        handleResponse(response);
        return response;
      } catch (error: any) {
        console.error("API: DELETE: Error: ", error);
        return handleError(error);
      }
    },
    
    // Method to manually refresh token
    refreshToken: async () => {
      console.log("API: Manual token refresh");
      
      try {
        const response = await ofetch(`${backendUrl}/api/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include',
        });
        
        console.log("API: Token refresh successful: ", response);
        handleResponse(response);
        return response;
      } catch (error: any) {
        console.error("API: Token refresh failed: ", error);
        return handleError(error);
      }
    }
  };
};
