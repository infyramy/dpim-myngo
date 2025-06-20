<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">My Products</h1>
        <p class="text-muted-foreground mt-1">
          Manage your products and services
        </p>
      </div>
      <Button
        @click="showAddProductDialog = true"
        :disabled="isSubmitting"
        class="flex items-center gap-2"
      >
        <PlusIcon class="h-4 w-4" />
        Product Form
      </Button>
    </div>

    <!-- Search and Filters -->
    <Card>
      <CardContent class="p-6">
        <div class="space-y-4">
          <!-- Search Input -->
          <div class="relative">
            <SearchIcon
              class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search your products, services, or tags..."
              class="pl-9 w-full"
              @input="performSearch"
            />
          </div>

          <!-- Filter Controls -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label for="productCategory">Category</Label>
              <Select
                v-model="filters.category"
                @update:modelValue="performSearch"
              >
                <SelectTrigger id="productCategory" class="w-full mt-1">
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

            <div>
              <Label for="statusFilter">Status</Label>
              <Select
                v-model="filters.status"
                @update:modelValue="performSearch"
              >
                <SelectTrigger id="statusFilter" class="w-full mt-1">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label for="featuredFilter">Featured</Label>
              <Select
                v-model="filters.featured"
                @update:modelValue="performSearch"
              >
                <SelectTrigger id="featuredFilter" class="w-full mt-1">
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  <SelectItem value="true">Featured only</SelectItem>
                  <SelectItem value="false">Non-featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label for="tagFilter">Tag</Label>
              <Select v-model="filters.tag" @update:modelValue="performSearch">
                <SelectTrigger id="tagFilter" class="w-full mt-1">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  <SelectItem
                    v-for="tag in allTags"
                    :key="tag.id"
                    :value="tag.name"
                  >
                    {{ tag.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="flex items-end">
              <Button
                variant="outline"
                class="w-full flex items-center gap-2"
                @click="resetFilters"
              >
                <RefreshCcwIcon class="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Products Section -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">
          Your Products
          <span class="text-base font-normal text-muted-foreground ml-2">
            ({{ totalResults }} products)
          </span>
        </h2>
        <div class="flex items-center gap-2">
          <p class="text-sm text-muted-foreground">Sort by:</p>
          <Select v-model="sortBy" @update:modelValue="performSearch">
            <SelectTrigger class="w-[180px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="status">Status</SelectItem>
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

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div
          class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4"
        >
          <AlertCircleIcon class="h-8 w-8 text-red-600" />
        </div>
        <h3 class="text-lg font-semibold mb-2">Error Loading Products</h3>
        <p class="text-muted-foreground mb-4">{{ error }}</p>
        <Button @click="fetchProducts" class="flex items-center gap-2">
          <RefreshCcwIcon class="h-4 w-4" />
          Try Again
        </Button>
      </div>

      <!-- Products Grid -->
      <div
        v-else-if="paginatedResults.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        <Card
          v-for="product in paginatedResults"
          :key="product.id"
          class="hover:shadow-md transition-shadow overflow-hidden"
        >
          <CardContent class="p-0">
            <!-- Product Image -->
            <div class="aspect-video w-full overflow-hidden bg-muted relative">
              <img
                :src="product.image"
                :alt="product.name"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div class="absolute top-2 right-2 flex gap-1">
                <Badge
                  :variant="
                    product.status === 'active' ? 'default' : 'secondary'
                  "
                  class="text-xs capitalize"
                >
                  {{ product.status }}
                </Badge>
                <Badge
                  v-if="product.featured"
                  variant="default"
                  class="text-xs bg-yellow-500"
                >
                  Featured
                </Badge>
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-4 space-y-3">
              <div>
                <h3 class="font-semibold text-lg line-clamp-1 mb-1">
                  {{ product.name }}
                </h3>
                <div class="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline" class="text-xs">{{
                    getCategoryLabel(product.category)
                  }}</Badge>
                  <Badge
                    v-if="product.business"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ product.business.label }}
                  </Badge>
                </div>
              </div>

              <p class="text-sm text-muted-foreground line-clamp-2">
                {{ product.description }}
              </p>

              <!-- Tags -->
              <div
                v-if="product.tags && product.tags.length > 0"
                class="flex flex-wrap gap-1"
              >
                <div
                  v-for="tag in product.tags.slice(0, 3)"
                  :key="tag.id"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-sm"
                >
                  <TagIcon class="h-3 w-3" />
                  {{ tag.name }}
                </div>
                <div
                  v-if="product.tags.length > 3"
                  class="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded-sm"
                >
                  +{{ product.tags.length - 3 }} more
                </div>
              </div>

              <div
                class="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>Created: {{ formatDate(product.createdAt) }}</span>
                <div class="flex items-center gap-1">
                  <CalendarIcon class="h-3 w-3" />
                  {{ formatDate(product.createdAt) }}
                </div>
              </div>

              <div class="flex justify-between pt-2 gap-2">
                <div class="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    class="flex items-center gap-1 flex-1"
                    @click="viewProductDetail(product)"
                  >
                    <EyeIcon class="h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    class="flex items-center gap-1 flex-1"
                    @click="editProduct(product)"
                  >
                    <PencilIcon class="h-3 w-3" />
                    Edit
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  class="flex items-center gap-1"
                  @click="deleteProduct(product.id)"
                  :disabled="isSubmitting"
                >
                  <TrashIcon class="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div
          class="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4"
        >
          <PackageIcon class="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-semibold mb-2">
          {{ hasActiveFilters ? "No products found" : "No products yet" }}
        </h3>
        <p class="text-muted-foreground mb-4">
          {{
            hasActiveFilters
              ? "Try adjusting your search criteria or reset filters"
              : 'You haven\'t added any products yet. Click "Add Product" to get started.'
          }}
        </p>
        <div class="flex justify-center gap-2">
          <Button
            v-if="hasActiveFilters"
            variant="outline"
            @click="resetFilters"
            class="flex items-center gap-2"
          >
            <RefreshCcwIcon class="h-4 w-4" />
            Reset Filters
          </Button>
          <Button
            @click="showAddProductDialog = true"
            class="flex items-center gap-2"
          >
            <PlusIcon class="h-4 w-4" />
            Product Form
          </Button>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="paginatedResults.length > 0 && totalPages > 1"
        class="flex items-center justify-between"
      >
        <p class="text-sm text-muted-foreground">
          Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, totalResults) }} of
          {{ totalResults }} products
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
      <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <!-- Fixed Header -->
        <DialogHeader class="px-6 py-4 border-b">
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            Detailed information about your product
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
                  <Badge
                    :variant="
                      selectedProduct.status === 'active'
                        ? 'default'
                        : 'secondary'
                    "
                    class="capitalize"
                  >
                    {{ selectedProduct.status }}
                  </Badge>
                  <Badge
                    v-if="selectedProduct.featured"
                    variant="default"
                    class="bg-yellow-500"
                  >
                    Featured
                  </Badge>
                </div>
              </div>
              <div class="flex items-center gap-3 mb-4">
                <Badge variant="outline">{{
                  getCategoryLabel(selectedProduct.category)
                }}</Badge>
                <Badge v-if="selectedProduct.business" variant="secondary">
                  {{ selectedProduct.business.label }}
                </Badge>
                <div
                  class="flex items-center gap-1 text-sm text-muted-foreground"
                >
                  <CalendarIcon class="h-4 w-4" />
                  Created {{ formatDate(selectedProduct.createdAt) }}
                </div>
              </div>
            </div>

            <Separator />

            <!-- Product Description -->
            <div>
              <h3 class="font-semibold mb-3">Product Description</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ selectedProduct.description }}
              </p>
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

            <!-- Product Tags -->
            <div v-if="selectedProduct.tags && selectedProduct.tags.length > 0">
              <h3 class="font-semibold mb-3">Tags</h3>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="tag in selectedProduct.tags"
                  :key="tag.id"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-md"
                >
                  <TagIcon class="h-3 w-3" />
                  {{ tag.name }}
                </div>
              </div>
            </div>

            <Separator />

            <!-- Product Statistics -->
            <div>
              <h3 class="font-semibold mb-3">Product Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Status:</span>
                    <Badge
                      :variant="
                        selectedProduct.status === 'active'
                          ? 'default'
                          : 'secondary'
                      "
                      class="text-xs"
                    >
                      {{ selectedProduct.status }}
                    </Badge>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Category:</span>
                    <span class="text-sm">{{
                      getCategoryLabel(selectedProduct.category)
                    }}</span>
                  </div>
                  <div
                    v-if="selectedProduct.business"
                    class="flex justify-between"
                  >
                    <span class="text-sm text-muted-foreground">Business:</span>
                    <span class="text-sm">{{
                      selectedProduct.business.label
                    }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Featured:</span>
                    <span class="text-sm">{{
                      selectedProduct.featured ? "Yes" : "No"
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Created:</span>
                    <span class="text-sm">{{
                      formatDate(selectedProduct.createdAt)
                    }}</span>
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
            class="flex items-center gap-2"
            @click="editProduct(selectedProduct!)"
          >
            <PencilIcon class="h-4 w-4" />
            Edit Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Add/Edit Product Dialog -->
    <Dialog
      :open="showAddProductDialog"
      @update:open="showAddProductDialog = $event"
    >
      <DialogContent class="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader class="px-6 py-4 border-b">
          <DialogTitle>{{
            editingProduct ? "Edit Product" : "Add New Product"
          }}</DialogTitle>
          <DialogDescription>
            {{
              editingProduct
                ? "Update your product information."
                : "Fill in the form below to add a new product."
            }}
          </DialogDescription>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4">
          <form @submit.prevent="saveProduct" class="space-y-6">
            <div class="grid grid-cols-1 gap-4">
              <div>
                <Label for="productName">Product Name *</Label>
                <Input
                  id="productName"
                  v-model="productForm.name"
                  placeholder="Enter product name"
                  class="mt-1"
                  required
                />
              </div>

              <div>
                <Label for="productBusiness">Business *</Label>
                <Select v-model="productForm.businessId">
                  <SelectTrigger id="productBusiness" class="w-full mt-1">
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="business in businesses"
                      :key="business.value"
                      :value="business.value.toString()"
                    >
                      {{ business.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label for="productCategory">Category *</Label>
                <Select v-model="productForm.category">
                  <SelectTrigger id="productCategory" class="w-full mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div>
                <Label for="productDescription">Description *</Label>
                <Textarea
                  id="productDescription"
                  v-model="productForm.description"
                  placeholder="Enter detailed product description"
                  class="mt-1"
                  rows="4"
                  required
                />
              </div>

              <div>
                <Label for="productImage">Product Image URL</Label>
                <Input
                  id="productImage"
                  v-model="productForm.image"
                  placeholder="Enter image URL (optional)"
                  class="mt-1"
                />
                <p class="text-xs text-muted-foreground mt-1">
                  Leave empty for default placeholder image
                </p>
              </div>

              <div>
                <Label for="productLink">Product Link</Label>
                <Input
                  id="productLink"
                  v-model="productForm.link"
                  placeholder="Enter product link (e.g., Shopee, Lazada)"
                  class="mt-1"
                />
                <p class="text-xs text-muted-foreground mt-1">
                  Add link to your product on external platforms
                </p>
              </div>

              <div>
                <Label for="productTags">Tags</Label>
                <TagInput
                  id="productTags"
                  v-model="productForm.tags"
                  :suggestions="tagSuggestions"
                  :max-tags="10"
                  placeholder="Add tags for product matching..."
                  help-text="Press Enter or comma to add tags. Tags help with product matching."
                  class="mt-1"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label for="productStatus">Status</Label>
                  <Select v-model="productForm.status">
                    <SelectTrigger id="productStatus" class="w-full mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="flex items-center justify-center">
                  <div class="flex items-center space-x-2">
                    <input
                      id="featured"
                      type="checkbox"
                      v-model="productForm.featured"
                      class="rounded"
                    />
                    <Label for="featured">Featured product</Label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter class="px-6 py-4 border-t">
          <Button variant="outline" @click="cancelEdit" type="button">
            Cancel
          </Button>
          <Button
            @click="saveProduct"
            type="submit"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ editingProduct ? "Update Product" : "Create Product" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ productToDelete?.name }}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            @click="showDeleteDialog = false"
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            type="button"
            :disabled="isSubmitting"
          >
            Delete Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/ui/tag-input";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PackageIcon,
  SearchIcon,
  RefreshCcwIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  AlertCircleIcon,
  TagIcon,
} from "lucide-vue-next";

import { apiFetching } from "@/services/api-fetching";
import { toast } from "vue-sonner";

// Types
interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Business {
  value: number;
  label: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  status: "active" | "inactive";
  featured: boolean;
  slug: string;
  businessId: number;
  business?: Business;
  tags: Tag[];
  link?: string;
  createdAt: string;
  modifiedAt?: string;
}

interface Category {
  value: string;
  label: string;
}

// Reactive state
const showAddProductDialog = ref(false);
const showDeleteDialog = ref(false);
const showProductDetailDialog = ref(false);
const editingProduct = ref<Product | null>(null);
const selectedProduct = ref<Product | null>(null);
const productToDelete = ref<Product | null>(null);
const searchQuery = ref("");
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(9);
const sortBy = ref("newest");

// Filters
const filters = ref({
  category: "all",
  status: "all",
  featured: "all",
  tag: "all",
});

// Categories
const categories = ref<Category[]>([]);

// Products data
const products = ref<Product[]>([]);

// Business data
const businesses = ref<Business[]>([]);

// Tags data
const allTags = ref<Tag[]>([]);
const tagSuggestions = ref<string[]>([]);

// Product form
const defaultProductForm = {
  name: "",
  description: "",
  category: "",
  image: "",
  status: "active" as "active" | "inactive",
  featured: false,
  tags: [] as string[],
  businessId: "",
  link: "",
};

const productForm = ref({ ...defaultProductForm });

// API Methods

const fetchProductCategories = async () => {
  try {
    const response = await apiFetching().get(
      "/lookup?lookup_group=product_category",
      true
    );

    categories.value = response.data.lookup_data.map((category: any) => ({
      value: category.value,
      label: category.title,
    }));
  } catch (err: any) {
    console.error("Error fetching product categories:", err);
  }
};

const fetchProducts = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await apiFetching().get("/products", true);

    if (response.success && response.data?.products) {
      products.value = response.data.products;
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

const fetchUserTags = async () => {
  try {
    const response = await apiFetching().get("/products/tags/all", true);

    if (response.success && response.data?.tags) {
      allTags.value = response.data.tags;
      tagSuggestions.value = response.data.tags.map((tag: Tag) => tag.name);
    }
  } catch (err: any) {
    console.error("Error fetching tags:", err);
    // Don't show error for tags as it's not critical
  }
};

const fetchBusinesses = async () => {
  try {
    const response = await apiFetching().get("/businesses", true);

    // businesses.value = response.data.businesses.filter(
    //   value: category.value,
    //   label: category.title,
    // );

    console.log("response:", response.data.businesses);

    businesses.value = response.data.businesses.map((business: any) => ({
      value: business.id,
      label: business.name,
    }));
  } catch (err: any) {
    console.error("Error fetching businesses:", err);
    toast.error("Failed to load businesses. Please try again.");
  }
};

const createProduct = async (productData: any) => {
  try {
    const response = await apiFetching().post("/products", productData, true);

    if (response.success && response.data?.product) {
      products.value.unshift(response.data.product);
      toast.success("Product created successfully!");
      return response.data.product;
    } else {
      throw new Error(response.message || "Failed to create product");
    }
  } catch (err: any) {
    console.error("Error creating product:", err);
    toast.error(err.message || "Failed to create product. Please try again.");
    throw err;
  }
};

const updateProduct = async (productId: number, productData: any) => {
  try {
    const response = await apiFetching().put(
      `/products/${productId}`,
      productData,
      true
    );

    if (response.success && response.data?.product) {
      const index = products.value.findIndex((p) => p.id === productId);
      if (index > -1) {
        products.value[index] = response.data.product;
      }
      toast.success("Product updated successfully!");
      return response.data.product;
    } else {
      throw new Error(response.message || "Failed to update product");
    }
  } catch (err: any) {
    console.error("Error updating product:", err);
    toast.error(err.message || "Failed to update product. Please try again.");
    throw err;
  }
};

const deleteProductApi = async (productId: number) => {
  try {
    const response = await apiFetching().delete(`/products/${productId}`, true);

    if (response.success) {
      const index = products.value.findIndex((p) => p.id === productId);
      if (index > -1) {
        products.value.splice(index, 1);
      }
      toast.success("Product deleted successfully!");
    } else {
      throw new Error(response.message || "Failed to delete product");
    }
  } catch (err: any) {
    console.error("Error deleting product:", err);
    toast.error(err.message || "Failed to delete product. Please try again.");
    throw err;
  }
};

// Computed properties
const filteredResults = computed(() => {
  let results = [...products.value];

  // Apply search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    results = results.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
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

  if (filters.value.status !== "all") {
    results = results.filter(
      (product) => product.status === filters.value.status
    );
  }

  if (filters.value.featured !== "all") {
    const isFeatured = filters.value.featured === "true";
    results = results.filter((product) => product.featured === isFeatured);
  }

  if (filters.value.tag !== "all") {
    results = results.filter((product) =>
      product.tags.some((tag) => tag.name === filters.value.tag)
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
    case "category":
      results.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case "status":
      results.sort((a, b) => a.status.localeCompare(b.status));
      break;
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

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== "" ||
    filters.value.category !== "all" ||
    filters.value.status !== "all" ||
    filters.value.featured !== "all" ||
    filters.value.tag !== "all"
  );
});

const isFormValid = computed(() => {
  return (
    productForm.value.name.trim() !== "" &&
    productForm.value.category !== "" &&
    productForm.value.description.trim() !== "" &&
    productForm.value.businessId !== ""
  );
});

// Helper functions
const getCategoryLabel = (value: string): string => {
  const category = categories.value.find((cat) => cat.value === value);
  return category ? category.label : value;
};

const getBusinessName = (businessId: number): string => {
  const business = businesses.value.find((b) => b.value === businessId);
  return business ? business.label : "Unknown Business";
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Methods
const performSearch = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  searchQuery.value = "";
  filters.value = {
    category: "all",
    status: "all",
    featured: "all",
    tag: "all",
  };
  sortBy.value = "newest";
  currentPage.value = 1;
};

const viewProductDetail = (product: Product) => {
  selectedProduct.value = product;
  showProductDetailDialog.value = true;
};

const editProduct = (product: Product) => {
  editingProduct.value = product;
  productForm.value = {
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.image || "",
    status: product.status,
    featured: product.featured,
    tags: product.tags?.map((tag) => tag.name) || [],
    businessId: product.businessId ? product.businessId.toString() : "",
    link: product.link || "",
  };
  showProductDetailDialog.value = false;
  showAddProductDialog.value = true;
};

const deleteProduct = (productId: number) => {
  const product = products.value.find((p) => p.id === productId);
  if (product) {
    productToDelete.value = product;
    showDeleteDialog.value = true;
  }
};

const confirmDelete = async () => {
  if (productToDelete.value && !isSubmitting.value) {
    try {
      isSubmitting.value = true;
      await deleteProductApi(productToDelete.value.id);
      showDeleteDialog.value = false;
      productToDelete.value = null;
    } catch (error) {
      // Error handling is done in the API method
    } finally {
      isSubmitting.value = false;
    }
  }
};

const saveProduct = async () => {
  if (!isFormValid.value || isSubmitting.value) {
    return;
  }

  try {
    isSubmitting.value = true;

    const productData = {
      name: productForm.value.name,
      description: productForm.value.description,
      category: productForm.value.category,
      image: productForm.value.image || null,
      status: productForm.value.status,
      featured: productForm.value.featured,
      tags: productForm.value.tags,
      businessId: parseInt(productForm.value.businessId),
      link: productForm.value.link || null,
    };

    if (editingProduct.value) {
      await updateProduct(editingProduct.value.id, productData);
    } else {
      await createProduct(productData);
    }

    cancelEdit();
  } catch (error) {
    // Error handling is done in the API methods
  } finally {
    isSubmitting.value = false;
  }
};

const cancelEdit = () => {
  showAddProductDialog.value = false;
  editingProduct.value = null;
  productForm.value = { ...defaultProductForm };
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy text: ", err);
    toast.error("Failed to copy link");
  }
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchProducts(),
    fetchUserTags(),
    fetchBusinesses(),
    fetchProductCategories(),
  ]);
});
</script>
