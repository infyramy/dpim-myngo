<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-muted-foreground mt-1">Selamat datang ke dashboard anda</p>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Perniagaan</p>
              <p class="text-2xl font-bold">{{ businessCount }}</p>
            </div>
            <div class="bg-blue-500/10 p-3 rounded-full">
              <BuildingIcon class="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Produk</p>
              <p class="text-2xl font-bold">{{ productCount }}</p>
            </div>
            <div class="bg-green-500/10 p-3 rounded-full">
              <PackageIcon class="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Carian Bulan Ini</p>
              <p class="text-2xl font-bold">{{ searchCount }}</p>
            </div>
            <div class="bg-purple-500/10 p-3 rounded-full">
              <SearchIcon class="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <Card>
      <CardHeader>
        <CardTitle>Tindakan Pantas</CardTitle>
        <CardDescription>Akses pantas ke ciri-ciri utama</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            @click="navigateTo('/user/business')" 
            variant="outline" 
            class="h-20 flex flex-col items-center justify-center gap-2 hover:bg-muted"
          >
            <BuildingIcon class="h-6 w-6 text-blue-500" />
            <span class="text-sm font-medium">Urus Perniagaan</span>
          </Button>
          
          <Button 
            @click="navigateTo('/user/products')" 
            variant="outline" 
            class="h-20 flex flex-col items-center justify-center gap-2 hover:bg-muted"
          >
            <PackageIcon class="h-6 w-6 text-green-500" />
            <span class="text-sm font-medium">Urus Produk</span>
          </Button>
          
          <Button 
            @click="navigateTo('/user/product-matching')" 
            variant="outline" 
            class="h-20 flex flex-col items-center justify-center gap-2 hover:bg-muted"
          >
            <SearchIcon class="h-6 w-6 text-purple-500" />
            <span class="text-sm font-medium">Padanan Produk</span>
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Activity & Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Products -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Produk Terkini</CardTitle>
            <CardDescription>Produk yang baru didaftarkan</CardDescription>
          </div>
          <Button variant="ghost" size="sm" @click="navigateTo('/user/products')">
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent>
          <div v-if="recentProducts.length > 0" class="space-y-4">
            <div 
              v-for="product in recentProducts" 
              :key="product.id"
              class="flex items-center gap-3 p-3 rounded-lg border"
            >
              <div class="w-12 h-12 bg-muted rounded-md overflow-hidden">
                <img :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ product.name }}</p>
                <p class="text-xs text-muted-foreground">{{ product.businessName }}</p>
              </div>
              <Badge variant="outline" class="text-xs">{{ product.category }}</Badge>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <PackageIcon class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">Tiada produk didaftarkan</p>
          </div>
        </CardContent>
      </Card>

      <!-- Business Overview -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Perniagaan Anda</CardTitle>
            <CardDescription>Ringkasan perniagaan berdaftar</CardDescription>
          </div>
          <Button variant="ghost" size="sm" @click="navigateTo('/user/business')">
            Urus
          </Button>
        </CardHeader>
        <CardContent>
          <div v-if="recentBusinesses.length > 0" class="space-y-4">
            <div 
              v-for="business in recentBusinesses" 
              :key="business.id"
              class="flex items-center gap-3 p-3 rounded-lg border"
            >
              <div class="bg-blue-500/10 p-2 rounded-md">
                <BuildingIcon class="h-6 w-6 text-blue-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ business.name }}</p>
                <p class="text-xs text-muted-foreground">SSM: {{ business.ssm }}</p>
              </div>
              <Badge variant="outline" class="text-xs">{{ business.type }}</Badge>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <BuildingIcon class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground mb-2">Tiada perniagaan didaftarkan</p>
            <Button size="sm" @click="navigateTo('/user/business')">
              Daftar Perniagaan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Getting Started -->
    <Card v-if="businessCount === 0 || productCount === 0">
      <CardContent class="p-6">
        <div class="flex items-start gap-4">
          <div class="bg-primary/10 p-2 rounded-full">
            <InfoIcon class="h-5 w-5 text-primary" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold mb-2">Mula Menggunakan Platform</h3>
            <p class="text-sm text-muted-foreground mb-4">
              Untuk memaksimumkan penggunaan platform ini, pastikan anda telah:
            </p>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 rounded-full bg-primary"></div>
                <span :class="businessCount > 0 ? 'line-through text-muted-foreground' : ''">
                  Mendaftarkan perniagaan anda
                </span>
                <CheckIcon v-if="businessCount > 0" class="h-4 w-4 text-green-500" />
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 rounded-full bg-primary"></div>
                <span :class="productCount > 0 ? 'line-through text-muted-foreground' : ''">
                  Menambah produk atau perkhidmatan
                </span>
                <CheckIcon v-if="productCount > 0" class="h-4 w-4 text-green-500" />
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 rounded-full bg-primary"></div>
                <span>Meneroka padanan produk dari ahli lain</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BuildingIcon, 
  PackageIcon, 
  SearchIcon, 
  InfoIcon, 
  CheckIcon 
} from "lucide-vue-next"

// Sample data - would normally be loaded from an API
const businesses = ref([
  {
    id: 1,
    name: 'ABC Sdn. Bhd.',
    ssm: '202201234567',
    type: 'Sdn Bhd'
  }
])

const products = ref([
  {
    id: 1,
    name: 'Produk Contoh',
    businessName: 'ABC Sdn. Bhd.',
    category: 'Elektronik',
    image: 'https://placehold.co/100x100/webp'
  }
])

// Computed values
const businessCount = computed(() => businesses.value.length)
const productCount = computed(() => products.value.length)
const searchCount = computed(() => 12) // Mock data

const recentProducts = computed(() => products.value.slice(0, 3))
const recentBusinesses = computed(() => businesses.value.slice(0, 3))

// Navigation function
const navigateTo = (path: string) => {
  // This would typically use Vue Router
  console.log(`Navigate to: ${path}`)
  // For now, you can implement actual navigation based on your routing setup
}
</script>
