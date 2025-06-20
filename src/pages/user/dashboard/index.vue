<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-muted-foreground">Overview of your business activities</p>
    </div>

    <!-- Key Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="text-sm text-muted-foreground">Total Businesses</div>
          <div class="text-2xl font-bold">{{ businessCount }}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-sm text-muted-foreground">Total Products</div>
          <div class="text-2xl font-bold">{{ productCount }}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-sm text-muted-foreground">Active Listings</div>
          <div class="text-2xl font-bold">{{ activeListings }}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-sm text-muted-foreground">Profile Views</div>
          <div class="text-2xl font-bold">{{ profileViews }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Action Required -->
    <Card v-if="pendingActions.length > 0">
      <CardHeader>
        <CardTitle class="text-lg">Action Required</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div 
            v-for="action in pendingActions" 
            :key="action.id"
            class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div>
              <div class="font-medium">{{ action.title }}</div>
              <div class="text-sm text-muted-foreground">{{ action.description }}</div>
            </div>
            <Button size="sm" @click="handleAction(action.action)">
              {{ action.buttonText }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="recentProducts.length > 0" class="space-y-3">
            <div 
              v-for="product in recentProducts" 
              :key="product.id"
              class="flex items-center gap-3 p-2 hover:bg-muted rounded-lg"
            >
              <div class="w-10 h-10 bg-gray-200 rounded flex-shrink-0"></div>
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ product.name }}</div>
                <div class="text-sm text-muted-foreground">{{ product.category }}</div>
              </div>
              <Badge variant="secondary" class="text-xs">Active</Badge>
            </div>
          </div>
          <div v-else class="text-center py-6 text-muted-foreground">
            No products added yet
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Your Businesses</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="businesses.length > 0" class="space-y-3">
            <div 
              v-for="business in businesses" 
              :key="business.id"
              class="flex items-center justify-between p-2 hover:bg-muted rounded-lg"
            >
              <div>
                <div class="font-medium">{{ business.name }}</div>
                <div class="text-sm text-muted-foreground">{{ business.ssm }}</div>
              </div>
              <Badge variant="outline" class="text-xs">{{ business.type }}</Badge>
            </div>
          </div>
          <div v-else class="text-center py-6 text-muted-foreground">
            No businesses registered yet
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Links -->
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            class="h-auto p-4 flex flex-col gap-2"
            @click="navigateTo('/user/businesses/add')"
          >
            <BuildingIcon class="h-5 w-5" />
            <span class="text-sm">Add Business</span>
          </Button>
          
          <Button 
            variant="outline" 
            class="h-auto p-4 flex flex-col gap-2"
            @click="navigateTo('/user/products')"
          >
            <PackageIcon class="h-5 w-5" />
            <span class="text-sm">Add Product</span>
          </Button>
          
          <Button 
            variant="outline" 
            class="h-auto p-4 flex flex-col gap-2"
            @click="navigateTo('/user/product-matching')"
          >
            <SearchIcon class="h-5 w-5" />
            <span class="text-sm">Find Products</span>
          </Button>
          
          <Button 
            variant="outline" 
            class="h-auto p-4 flex flex-col gap-2"
            @click="navigateTo('/profile')"
          >
            <InfoIcon class="h-5 w-5" />
            <span class="text-sm">Update Profile</span>
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Getting Started Tips -->
    <Card v-if="showGettingStarted">
      <CardHeader>
        <CardTitle class="text-lg">Complete Your Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm">
            <CheckIcon v-if="businessCount > 0" class="h-4 w-4 text-green-500" />
            <div v-else class="w-4 h-4 rounded-full border-2 border-gray-300"></div>
            <span :class="businessCount > 0 ? 'line-through text-muted-foreground' : ''">
              Register at least one business
            </span>
          </div>
          
          <div class="flex items-center gap-2 text-sm">
            <CheckIcon v-if="productCount > 0" class="h-4 w-4 text-green-500" />
            <div v-else class="w-4 h-4 rounded-full border-2 border-gray-300"></div>
            <span :class="productCount > 0 ? 'line-through text-muted-foreground' : ''">
              Add your first product or service
            </span>
          </div>
          
          <div class="flex items-center gap-2 text-sm">
            <CheckIcon v-if="profileComplete" class="h-4 w-4 text-green-500" />
            <div v-else class="w-4 h-4 rounded-full border-2 border-gray-300"></div>
            <span :class="profileComplete ? 'line-through text-muted-foreground' : ''">
              Complete your profile information
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BuildingIcon,
  PackageIcon,
  SearchIcon,
  InfoIcon,
  CheckIcon,
} from "lucide-vue-next";
import { apiFetching } from "@/services/api-fetching";

// Dashboard data from API
const dashboardData = ref({
  statistics: {
    businessCount: 0,
    productCount: 0,
    activeListings: 0,
    profileViews: 0
  },
  recentProducts: [],
  businesses: [],
  pendingActions: [],
  profileComplete: false,
  showGettingStarted: true
});

const loading = ref(true);
const error = ref(null);

// Computed values
const businessCount = computed(() => dashboardData.value.statistics.businessCount);
const productCount = computed(() => dashboardData.value.statistics.productCount);
const activeListings = computed(() => dashboardData.value.statistics.activeListings);
const profileViews = computed(() => dashboardData.value.statistics.profileViews);
const profileComplete = computed(() => dashboardData.value.profileComplete);
const recentProducts = computed(() => dashboardData.value.recentProducts);
const businesses = computed(() => dashboardData.value.businesses);
const pendingActions = computed(() => dashboardData.value.pendingActions);
const showGettingStarted = computed(() => dashboardData.value.showGettingStarted);

// API call function
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await apiFetching().get("/dashboard", true);
    console.log("Dashboard response:", response);
    
    dashboardData.value = response.data;
  } catch (err) {
    error.value = err.message;
    console.error('Dashboard API error:', err);
  } finally {
    loading.value = false;
  }
};

// Functions
const navigateTo = (path: string) => {
  console.log(`Navigate to: ${path}`);
  // Implement actual navigation here using your router
  // router.push(path);
};

const handleAction = (action: string) => {
  switch (action) {
    case 'register-business':
      navigateTo('/user/businesses/add');
      break;
    case 'add-product':
      navigateTo('/user/products');
      break;
    case 'complete-profile':
      navigateTo('/profile');
      break;
    default:
      console.log(`Handle action: ${action}`);
  }
};

// Load dashboard data on component mount
onMounted(() => {
  fetchDashboardData();
});
</script>
