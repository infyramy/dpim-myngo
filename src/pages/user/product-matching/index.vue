<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div>
      <h1 class="text-3xl font-bold">Product Matching</h1>
      <p class="text-muted-foreground mt-1">
        Find products and services from DPIM members nationwide
      </p>
    </div>

    <!-- Modern Hero Search Section -->
    <div class="relative">
      <!-- Main Search Bar -->
      <Card
        class="border-none shadow-lg bg-gradient-to-br from-background to-muted/50"
      >
        <CardContent class="p-8">
          <div class="space-y-6">
            <!-- Primary Search Input -->
            <div class="relative group">
              <div
                class="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300"
              ></div>
              <div
                class="relative bg-card border border-border rounded-lg p-1 shadow-sm"
              >
                <div class="flex items-center">
                  <div class="flex-1 relative">
                    <SearchIcon
                      class="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
                    />
                    <Input
                      ref="searchInputRef"
                      v-model="searchQuery"
                      placeholder="Search for products, services, or businesses..."
                      class="pl-12 pr-4 py-4 text-lg border-0 shadow-none focus-visible:ring-0 bg-transparent h-auto"
                      @input="handleSearchInput"
                      @focus="showSuggestions = true"
                    />
                  </div>
                  <Button
                    size="lg"
                    class="mx-2"
                    @click="performSearch"
                    :disabled="isLoading"
                  >
                    <SearchIcon class="h-4 w-4 mr-2" />
                    {{ isLoading ? "Searching..." : "Search" }}
                  </Button>
                </div>

                <!-- Search Suggestions Dropdown -->
                <div
                  v-if="
                    showSuggestions &&
                    (filteredSuggestions.length > 0 || searchQuery.trim())
                  "
                  class="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-md z-50 max-h-64 overflow-y-auto"
                >
                  <div class="p-2">
                    <!-- Search History -->
                    <div
                      v-if="searchHistory.length > 0 && !searchQuery.trim()"
                      class="mb-2"
                    >
                      <p
                        class="text-xs text-muted-foreground px-3 py-2 font-medium"
                      >
                        Recent Searches
                      </p>
                      <div
                        v-for="(history, index) in searchHistory.slice(0, 3)"
                        :key="index"
                        class="flex items-center px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                        @click="selectSuggestion(history)"
                      >
                        <ClockIcon class="h-4 w-4 text-muted-foreground mr-3" />
                        <span class="text-sm">{{ history }}</span>
                      </div>
                    </div>

                    <!-- Dynamic Suggestions -->
                    <div v-if="filteredSuggestions.length > 0">
                      <p
                        class="text-xs text-muted-foreground px-3 py-2 font-medium"
                      >
                        Suggestions
                      </p>
                      <div
                        v-for="suggestion in filteredSuggestions.slice(0, 5)"
                        :key="suggestion.text"
                        class="flex items-center px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                        @click="selectSuggestion(suggestion.text)"
                      >
                        <component
                          :is="suggestion.icon"
                          class="h-4 w-4 text-muted-foreground mr-3"
                        />
                        <span class="text-sm">{{ suggestion.text }}</span>
                        <Badge variant="outline" class="ml-auto text-xs">{{
                          suggestion.category
                        }}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Filter Tags -->
            <div class="flex flex-wrap gap-3 justify-center">
              <Button
                v-for="quickFilter in quickFilters"
                :key="quickFilter.value"
                variant="outline"
                size="sm"
                class="rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                @click="applyQuickFilter(quickFilter)"
              >
                <TagIcon class="h-4 w-4 mr-2" />
                {{ quickFilter.label }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Active Filters Tags -->
      <div v-if="activeFilters.length > 0" class="mt-4">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="text-sm font-medium text-muted-foreground">
            Active filters:
          </p>
          <TransitionGroup
            name="filter-tag"
            tag="div"
            class="flex gap-2 flex-wrap"
          >
            <Badge
              v-for="filter in activeFilters"
              :key="filter.key"
              variant="secondary"
              class="inline-flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-secondary/80 transition-colors group"
            >
              <component :is="filter.icon" class="h-3 w-3" />
              <span>{{ filter.label }}: {{ filter.value }}</span>
              <button
                @click="removeFilter(filter.key)"
                class="ml-1 hover:bg-accent rounded-full p-0.5 transition-colors"
              >
                <XIcon class="h-3 w-3" />
              </button>
            </Badge>
          </TransitionGroup>
          <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-destructive"
            @click="clearAllFilters"
          >
            <TrashIcon class="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      </div>

      <!-- Advanced Filters Collapsible -->
      <Collapsible v-model:open="showAdvancedFilters">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            class="w-full mt-4 justify-center text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontalIcon class="h-4 w-4 mr-2" />
            Advanced Filters
            <ChevronDownIcon
              class="h-4 w-4 ml-2 transition-transform duration-200"
              :class="{ 'rotate-180': showAdvancedFilters }"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent class="mt-4">
          <Card>
            <CardContent class="p-6">
              <div class="grid grid-cols-1 gap-6">
                <!-- Category Filter -->
                <div class="space-y-3">
                  <Label class="text-sm font-medium flex items-center gap-2">
                    <TagIcon class="h-4 w-4" />
                    Product Category
                  </Label>
                  <Select
                    v-model="filters.category"
                    @update:modelValue="performSearch"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem
                        v-for="category in categories"
                        :key="category.value"
                        :value="category.value"
                      >
                        {{ category.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <!-- Filter Actions -->
              <div class="flex justify-between items-center mt-6 pt-4 border-t">
                <div class="text-sm text-muted-foreground">
                  {{ activeFilters.length }} filter{{
                    activeFilters.length !== 1 ? "s" : ""
                  }}
                  applied
                </div>
                <div class="flex gap-2">
                  <Button variant="outline" @click="resetFilters">
                    <RefreshCcwIcon class="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                  <Button @click="showAdvancedFilters = false">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>

    <!-- Search Results -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">
          Search Results
          <span class="text-base font-normal text-muted-foreground ml-2">
            ({{ totalResults }} results found)
          </span>
        </h2>
        <div class="flex items-center gap-2">
          <p class="text-sm text-muted-foreground">Sort by:</p>
          <Select v-model="sortBy" @update:modelValue="performSearch">
            <SelectTrigger class="w-[180px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        <Card v-for="i in 6" :key="i" class="animate-pulse">
          <CardContent class="p-4">
            <div class="space-y-3">
              <div class="h-32 bg-muted rounded"></div>
              <div class="h-4 bg-muted rounded w-3/4"></div>
              <div class="h-3 bg-muted rounded w-1/2"></div>
              <div class="h-3 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Products Grid -->
      <div
        v-else-if="paginatedResults.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        <Card
          v-for="product in paginatedResults"
          :key="product.id"
          class="hover:shadow-md transition-shadow"
        >
          <CardContent class="p-0">
            <!-- Product Image -->
            <div
              class="aspect-video w-full overflow-hidden bg-muted rounded-t-lg relative"
            >
              <img
                :src="product.image"
                :alt="product.name"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div class="absolute top-2 right-2">
                <Badge variant="secondary" class="text-xs">
                  {{ product.market }}
                </Badge>
              </div>
              <div v-if="product.isVerified" class="absolute top-2 left-2">
                <Badge variant="default" class="text-xs bg-green-500">
                  Verified
                </Badge>
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-4 space-y-3">
              <div>
                <h3 class="font-semibold text-lg line-clamp-1 mb-1">
                  {{ product.name }}
                </h3>
                <Badge variant="outline" class="text-xs">{{
                  product.category
                }}</Badge>
              </div>

              <div class="space-y-2">
                <div
                  v-if="product.businessName"
                  class="flex items-center gap-2"
                >
                  <BuildingIcon
                    class="h-4 w-4 text-muted-foreground flex-shrink-0"
                  />
                  <p class="text-sm text-muted-foreground truncate">
                    {{ product.businessName }}
                  </p>
                </div>
                <div v-if="product.location" class="flex items-center gap-2">
                  <MapPinIcon
                    class="h-4 w-4 text-muted-foreground flex-shrink-0"
                  />
                  <p class="text-sm text-muted-foreground truncate">
                    {{ product.location }}
                  </p>
                </div>

                <!-- Tags -->
                <div
                  v-if="product.tags && product.tags.length > 0"
                  class="flex flex-wrap gap-1"
                >
                  <div
                    v-for="tag in product.tags.slice(0, 2)"
                    :key="tag.id"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-sm"
                  >
                    <TagIcon class="h-3 w-3" />
                    {{ tag.name }}
                  </div>
                  <div
                    v-if="product.tags.length > 2"
                    class="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded-sm"
                  >
                    +{{ product.tags.length - 2 }} more
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-end pt-2">
                <Button
                  size="sm"
                  class="flex items-center gap-2"
                  @click="viewProductDetail(product)"
                >
                  <EyeIcon class="h-3 w-3" />
                  View More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-12">
        <div
          class="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4"
        >
          <SearchIcon class="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-semibold mb-2">No results found</h3>
        <p class="text-muted-foreground mb-4">
          Try adjusting your search criteria or reset filters
        </p>
        <Button variant="outline" @click="resetFilters"> Reset Filters </Button>
      </div>

      <!-- Pagination -->
      <div
        v-if="paginatedResults.length > 0"
        class="flex items-center justify-between"
      >
        <p class="text-sm text-muted-foreground">
          Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, totalResults) }} of
          {{ totalResults }} results
        </p>
        <div class="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </Button>

          <Button
            v-for="page in visiblePages"
            :key="page"
            :variant="page === currentPage ? 'default' : 'outline'"
            size="sm"
            class="h-8 w-8"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>

          <Button
            variant="outline"
            size="icon"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Product Detail Dialog -->
    <Dialog v-model:open="showProductDetailDialog">
      <DialogContent class="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
        <!-- Fixed Header -->
        <DialogHeader class="px-6 py-4 border-b">
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            Detailed information about the product and business
          </DialogDescription>
        </DialogHeader>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="selectedProduct" class="grid gap-6">
            <!-- Product Image -->
            <div
              class="aspect-video w-full overflow-hidden bg-muted rounded-lg"
            >
              <img
                :src="selectedProduct.image"
                :alt="selectedProduct.name"
                class="h-full w-full object-cover"
              />
            </div>

            <!-- Product Info -->
            <div>
              <div class="flex items-start justify-between mb-3">
                <h2 class="text-2xl font-bold">{{ selectedProduct.name }}</h2>
                <div class="flex gap-2">
                  <Badge>{{ selectedProduct.market }}</Badge>
                  <Badge
                    v-if="selectedProduct.isVerified"
                    variant="default"
                    class="bg-green-500"
                  >
                    Verified
                  </Badge>
                </div>
              </div>
              <div class="flex items-center gap-3 mb-4">
                <Badge variant="outline">{{ selectedProduct.category }}</Badge>
              </div>
            </div>

            <Separator />

            <!-- Product Description -->
            <div>
              <h3 class="font-semibold mb-3">Product Description</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ selectedProduct.description }}
              </p>

              <!-- Additional details if available -->
              <div v-if="selectedProduct.features" class="mt-4">
                <h4 class="font-medium mb-2">Key Features:</h4>
                <ul class="text-sm text-muted-foreground space-y-1">
                  <li
                    v-for="feature in selectedProduct.features"
                    :key="feature"
                    class="flex items-center gap-2"
                  >
                    <div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>

            <Separator />

            <!-- Product Link -->
            <div v-if="selectedProduct.link">
              <h3 class="font-semibold mb-3">Product Link</h3>
              <div class="flex items-center gap-2">
                <a
                  :href="selectedProduct.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                >
                  {{ selectedProduct.link }}
                </a>
                <button
                  @click="copyToClipboard(selectedProduct.link)"
                  class="text-gray-500 hover:text-gray-700 text-xs"
                  type="button"
                >
                  Copy
                </button>
              </div>
            </div>

            <Separator />

            <!-- Business Information -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold">Business Information</h3>
                <div class="flex gap-2">
                  <Badge
                    v-if="selectedProduct.business?.mofRegistration"
                    variant="default"
                    class="text-xs bg-green-500"
                  >
                    <ShieldCheckIcon class="h-3 w-3 mr-1" />
                    MOF Registered
                  </Badge>
                  <Badge variant="secondary" class="text-xs">
                    {{ getBusinessTypeLabel(selectedProduct.business?.type) }}
                  </Badge>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Left Column -->
                <div class="space-y-4">
                  <!-- Business Name & Type -->
                  <div class="flex items-start gap-3">
                    <BuildingIcon
                      class="h-5 w-5 text-muted-foreground mt-0.5"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="font-medium truncate">
                        {{
                          selectedProduct.business?.name ||
                          selectedProduct.businessName
                        }}
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {{
                          getBusinessTypeLabel(
                            selectedProduct.business?.type
                          ) || selectedProduct.businessType
                        }}
                      </p>
                      <p
                        v-if="selectedProduct.business?.ssm"
                        class="text-xs text-muted-foreground"
                      >
                        SSM: {{ selectedProduct.business.ssm }}
                      </p>
                    </div>
                  </div>

                  <!-- Address -->
                  <div class="flex items-start gap-3">
                    <MapPinIcon class="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div class="min-w-0 flex-1">
                      <p class="text-sm">
                        {{
                          selectedProduct.business?.address ||
                          selectedProduct.location
                        }}
                      </p>
                    </div>
                  </div>

                  <!-- Contact Info -->
                  <div
                    v-if="
                      selectedProduct.business?.phone ||
                      selectedProduct.contact?.phone
                    "
                    class="flex items-center gap-3"
                  >
                    <PhoneIcon class="h-5 w-5 text-muted-foreground" />
                    <p class="text-sm">
                      {{
                        selectedProduct.business?.phone ||
                        selectedProduct.contact?.phone
                      }}
                    </p>
                  </div>

                  <div
                    v-if="
                      selectedProduct.business?.url ||
                      selectedProduct.contact?.website
                    "
                    class="flex items-center gap-3"
                  >
                    <GlobeIcon class="h-5 w-5 text-muted-foreground" />
                    <a
                      :href="
                        selectedProduct.business?.url ||
                        selectedProduct.contact?.website
                      "
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm text-primary hover:underline truncate"
                    >
                      {{
                        selectedProduct.business?.url ||
                        selectedProduct.contact?.website
                      }}
                    </a>
                  </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-4">
                  <!-- Business Sector -->
                  <div
                    v-if="selectedProduct.business?.sector"
                    class="flex items-center gap-3"
                  >
                    <TagIcon class="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p class="text-sm font-medium">Business Sector</p>
                      <p class="text-sm text-muted-foreground">
                        {{
                          getBusinessSectorLabel(
                            selectedProduct.business.sector
                          )
                        }}
                      </p>
                    </div>
                  </div>

                  <!-- Business Category -->
                  <div
                    v-if="selectedProduct.business?.category"
                    class="flex items-center gap-3"
                  >
                    <BuildingIcon class="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p class="text-sm font-medium">Business Category</p>
                      <p class="text-sm text-muted-foreground">
                        {{
                          getBusinessCategoryLabel(
                            selectedProduct.business.category
                          )
                        }}
                      </p>
                    </div>
                  </div>

                  <!-- MOF Registration -->
                  <div
                    v-if="
                      selectedProduct.business?.mofRegistration &&
                      selectedProduct.business?.mofRegistrationNumber
                    "
                    class="flex items-center gap-3"
                  >
                    <ShieldCheckIcon class="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p class="text-sm font-medium">MOF Registration</p>
                      <p class="text-sm text-muted-foreground">
                        {{ selectedProduct.business.mofRegistrationNumber }}
                      </p>
                    </div>
                  </div>

                  <!-- Business Established -->
                  <div
                    v-if="selectedProduct.business?.createdAt"
                    class="flex items-center gap-3"
                  >
                    <CalendarIcon class="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p class="text-sm font-medium">Registered</p>
                      <p class="text-sm text-muted-foreground">
                        {{ formatDate(selectedProduct.business.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fixed Footer -->
        <DialogFooter class="px-6 py-4 border-t gap-2">
          <Button variant="outline" @click="showProductDetailDialog = false">
            Close
          </Button>
          <Button
            v-if="selectedProduct?.link"
            variant="secondary"
            class="flex items-center gap-2"
            @click="visitProductLink"
          >
            <GlobeIcon class="h-4 w-4" />
            Visit Product
          </Button>
          <Button class="flex items-center gap-2" @click="contactBusiness">
            <MailIcon class="h-4 w-4" />
            Contact Business
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  SearchIcon,
  RefreshCcwIcon,
  BuildingIcon,
  MapPinIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  GlobeIcon,
  MailIcon,
  ClockIcon,
  TagIcon,
  XIcon,
  TrashIcon,
  SlidersHorizontalIcon,
  ChevronDownIcon,
  CalendarIcon,
  ShieldCheckIcon,
} from "lucide-vue-next";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { apiFetching } from "@/services/api-fetching";
import { toast } from "vue-sonner";

// Types
interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Business {
  id: number;
  name: string;
  ssm: string;
  phone: string;
  address: string;
  type: string;
  sector: string;
  category: string;
  mofRegistration: boolean;
  mofRegistrationNumber?: string;
  url?: string;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  businessName?: string;
  businessType?: string;
  description: string;
  category: string;
  market?: string;
  location?: string;
  fullAddress?: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  tags: Tag[];
  features?: string[];
  link?: string;
  business?: Business;
  contact?: {
    phone: string;
    email?: string;
    website?: string;
  };
  createdAt: string;
  modifiedAt?: string;
  slug: string;
  status: "active" | "inactive";
  featured: boolean;
  businessId?: number;
}

// Reactive state
const searchQuery = ref("");
const isLoading = ref(false);
const error = ref<string | null>(null);
const showProductDetailDialog = ref(false);
const selectedProduct = ref<Product | null>(null);
const currentPage = ref(1);
const itemsPerPage = ref(9);
const sortBy = ref("relevance");
const showSuggestions = ref(false);
const searchHistory = ref<string[]>([
  "water quality system",
  "batik clothing",
  "halal food",
]);
const showAdvancedFilters = ref(false);
const searchInputRef = ref<HTMLInputElement>();
const debounceTimer = ref<ReturnType<typeof setTimeout>>();

// Data state
const allProducts = ref<Product[]>([]);
const allTags = ref<Tag[]>([]);

// Filters
const filters = ref({
  category: "all",
  tag: "all",
});

// Filter options
const categories = ref([
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing & Fashion" },
  { value: "food", label: "Food & Beverages" },
  { value: "services", label: "Professional Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "automotive", label: "Automotive" },
  { value: "construction", label: "Construction" },
]);

// Search suggestions and quick filters
const searchSuggestions = ref([
  {
    text: "Smart Water Management",
    icon: "SmartphoneIcon",
    category: "Electronics",
  },
  { text: "Batik Collection", icon: "ShirtIcon", category: "Clothing" },
  { text: "Halal Food Products", icon: "UtensilsIcon", category: "Food" },
  { text: "Financial Consulting", icon: "BriefcaseIcon", category: "Services" },
  {
    text: "Healthcare Services",
    icon: "HeartHandshakeIcon",
    category: "Healthcare",
  },
  {
    text: "Digital Skills Training",
    icon: "GraduationCapIcon",
    category: "Education",
  },
  { text: "EV Maintenance", icon: "CarIcon", category: "Automotive" },
  { text: "Smart Building IoT", icon: "HammerIcon", category: "Construction" },
]);

// Quick filters computed from tags
const quickFilters = computed(() => {
  return allTags.value.slice(0, 8).map((tag) => ({
    label: tag.name,
    value: tag.slug,
    icon: "TagIcon",
    type: "tag",
  }));
});

// fetchProductCategories
const fetchProductCategories = async () => {
  try {
    const response = await apiFetching().get(
      "/lookup?lookup_group=product_category",
      true
    );

    categories.value = response.data.lookup_data.map((item: any) => ({
      value: item.value,
      label: item.title,
    }));
  } catch (error) {}
};

// API Methods
const fetchAllProducts = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Fetch all products from all users (no auth required)
    const response = await apiFetching().get("/products/all", false);

    if (response.success && response.data?.products) {
      // Transform the products to match our interface
      allProducts.value = response.data.products.map((product: any) => ({
        ...product,
        businessName: product.business?.name || "Business Name Not Available",
        businessType: product.business?.type || "Unknown",
        market: product.market || "Local",
        location: product.business?.address || "Malaysia",
        fullAddress: product.business?.address || "Address Not Available",
        rating: product.rating || 4.5,
        reviewCount:
          product.reviewCount || Math.floor(Math.random() * 200) + 10,
        isVerified: product.business?.mofRegistration || false,
        contact: {
          phone: product.business?.phone || "03-XXXX-XXXX",
          email: "contact@business.com",
          website: product.business?.url,
        },
      }));
    } else {
      throw new Error(response.message || "Failed to fetch products");
    }
  } catch (err: any) {
    console.error("Error fetching products:", err);
    error.value = err.message || "Failed to load products";
    toast.error("Failed to load products. Please try again.");
  } finally {
    isLoading.value = false;
  }
};

const fetchAllTags = async () => {
  try {
    // Fetch all tags from all users (no auth required)
    const response = await apiFetching().get(
      "/products/tags/all-public",
      false
    );

    if (response.success && response.data?.tags) {
      allTags.value = response.data.tags;

      // Update search suggestions with real tags
      const tagSuggestions = response.data.tags.map((tag: Tag) => ({
        text: tag.name,
        icon: "TagIcon",
        category: "Tag",
      }));

      // Merge with existing suggestions
      searchSuggestions.value = [...searchSuggestions.value, ...tagSuggestions];
    }
  } catch (err: any) {
    console.error("Error fetching tags:", err);
    // Don't show error for tags as it's not critical
  }
};

// Computed properties
const filteredResults = computed(() => {
  let results = [...allProducts.value];

  // Apply search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    results = results.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.businessName &&
          product.businessName.toLowerCase().includes(query)) ||
        product.category.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.name.toLowerCase().includes(query))
    );
  }

  // Apply filters
  if (filters.value.category !== "all") {
    results = results.filter(
      (product) => product.category === filters.value.category
    );
  }

  if (filters.value.tag !== "all") {
    results = results.filter((product) =>
      product.tags.some((tag) => tag.slug === filters.value.tag)
    );
  }

  // Apply sorting
  switch (sortBy.value) {
    case "newest":
      results.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "oldest":
      results.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case "name":
      results.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default: // relevance
      results.sort((a, b) => a.name.localeCompare(b.name));
  }

  return results;
});

const totalResults = computed(() => filteredResults.value.length);
const totalPages = computed(() =>
  Math.ceil(totalResults.value / itemsPerPage.value)
);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);

const paginatedResults = computed(() => {
  return filteredResults.value.slice(startIndex.value, endIndex.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// New computed properties for modern UI
const filteredSuggestions = computed(() => {
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.toLowerCase();
  return searchSuggestions.value.filter((suggestion) =>
    suggestion.text.toLowerCase().includes(query)
  );
});

const activeFilters = computed(() => {
  const active = [];

  if (filters.value.category !== "all") {
    const category = categories.value.find(
      (c) => c.value === filters.value.category
    );
    active.push({
      key: "category",
      label: "Category",
      value: category?.label || filters.value.category,
      icon: TagIcon,
    });
  }

  if (filters.value.tag !== "all") {
    const tag = allTags.value.find((t) => t.slug === filters.value.tag);
    active.push({
      key: "tag",
      label: "Tag",
      value: tag?.name || filters.value.tag,
      icon: TagIcon,
    });
  }

  return active;
});

// Methods
function performSearch() {
  isLoading.value = true;
  currentPage.value = 1;

  // Simulate API delay
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
}

function resetFilters() {
  searchQuery.value = "";
  filters.value = {
    category: "all",
    tag: "all",
  };
  sortBy.value = "relevance";
  currentPage.value = 1;
  performSearch();
}

function viewProductDetail(product: Product) {
  selectedProduct.value = product;
  showProductDetailDialog.value = true;
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function contactBusiness() {
  if (selectedProduct.value?.contact?.email) {
    window.open(`mailto:${selectedProduct.value.contact.email}`, "_blank");
  } else if (selectedProduct.value?.contact?.phone) {
    window.open(`tel:${selectedProduct.value.contact.phone}`, "_blank");
  }
}

function visitProductLink() {
  if (selectedProduct.value?.link) {
    window.open(selectedProduct.value.link, "_blank", "noopener,noreferrer");
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy text: ", err);
    toast.error("Failed to copy link");
  }
};

// Helper functions for business labels
const getBusinessTypeLabel = (type: string): string => {
  const types: { [key: string]: string } = {
    "sole-proprietorship": "Sole Proprietorship",
    partnership: "Partnership",
    "sdn-bhd": "Sdn Bhd",
    berhad: "Berhad",
  };
  return types[type] || type;
};

const getBusinessSectorLabel = (sector: string): string => {
  const sectors: { [key: string]: string } = {
    manufacturing: "Manufacturing",
    service: "Service",
  };
  return sectors[sector] || sector;
};

const getBusinessCategoryLabel = (category: string): string => {
  const categories: { [key: string]: string } = {
    startup: "Startup",
    micro: "Micro",
    small: "Small",
    medium: "Medium",
    large: "Large",
  };
  return categories[category] || category;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Enhanced methods for modern UI
const handleSearchInput = () => {
  clearTimeout(debounceTimer.value);
  debounceTimer.value = setTimeout(() => {
    performSearch();
  }, 300);
};

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion;
  showSuggestions.value = false;

  // Add to search history
  const index = searchHistory.value.indexOf(suggestion);
  if (index > -1) {
    searchHistory.value.splice(index, 1);
  }
  searchHistory.value.unshift(suggestion);
  searchHistory.value = searchHistory.value.slice(0, 5);

  performSearch();
};

const applyQuickFilter = (filter: any) => {
  if (filter.type === "category") {
    filters.value.category = filter.value;
  } else if (filter.type === "tag") {
    filters.value.tag = filter.value;
  }

  performSearch();
};

const removeFilter = (filterKey: string) => {
  if (filterKey === "category") {
    filters.value.category = "all";
  } else if (filterKey === "tag") {
    filters.value.tag = "all";
  }
  performSearch();
};

const clearAllFilters = () => {
  filters.value = {
    category: "all",
    tag: "all",
  };
  performSearch();
};

// Close suggestions when clicking outside
const handleClickOutside = (event: Event) => {
  if (!searchInputRef.value?.contains(event.target as Node)) {
    showSuggestions.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  await Promise.all([
    fetchAllProducts(),
    fetchAllTags(),
    fetchProductCategories(),
  ]);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.filter-tag-enter-active,
.filter-tag-leave-active {
  transition: all 0.3s ease;
}

.filter-tag-enter-from,
.filter-tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.filter-tag-move {
  transition: transform 0.3s ease;
}
</style>
