<template>
  <header class="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Mobile Toggle -->
        <div class="flex items-center gap-4">
          <button 
            class="lg:hidden p-1 rounded-md text-gray-300 hover:text-white hover:bg-gray-800"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <X v-if="isMobileMenuOpen" :size="24" />
            <Menu v-else :size="24" />
          </button>
          <router-link to="/" class="flex items-center space-x-2 group shrink-0">
            <span class="text-2xl font-bold text-white tracking-tight flex items-center gap-1">
              <span class="text-orange-400">a</span>
              mazon<span class="text-orange-400 text-sm">POC</span>
            </span>
          </router-link>
        </div>

        <!-- Desktop Search -->
        <div class="flex-1 max-w-2xl px-6 hidden lg:block relative" ref="searchContainerRef">
          <form @submit.prevent="handleSearch" class="flex">
            <input
              type="text"
              v-model="searchQuery"
              @focus="() => { if (searchSuggestions.length > 0) showSuggestions = true; }"
              placeholder="Search products..."
              class="w-full px-4 py-2 text-gray-900 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button 
              type="submit"
              class="px-6 py-2 bg-orange-400 hover:bg-orange-500 rounded-r-md text-gray-900 font-medium transition-colors"
            >
              <Search :size="20" />
            </button>
          </form>
          
          <!-- Live Suggestions Dropdown -->
          <div 
            v-if="showSuggestions && searchSuggestions.length > 0"
            v-motion
            :initial="{ opacity: 0, y: -5 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 150 } }"
            :leave="{ opacity: 0, y: -5, transition: { duration: 150 } }"
            class="absolute top-full left-6 right-6 mt-1 bg-white rounded-md shadow-2xl overflow-hidden border border-gray-200 z-50"
          >
            <router-link 
              v-for="s in searchSuggestions"
              :key="s._id || s.id"
              :to="`/products/${s._id || s.id}`" 
              @click="showSuggestions = false"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-gray-900 transition-colors"
            >
              <img :src="getSuggestionImage(s)" :alt="s.title" class="w-10 h-10 object-contain bg-white rounded" />
              <div class="flex-1 truncate text-sm font-bold">{{ s.title }}</div>
              <div class="font-black text-orange-600">{{ formatCurrency(s.price_minor || s.priceCents || 0) }}</div>
            </router-link>
            <router-link 
              :to="`/search?q=${encodeURIComponent(searchQuery)}`" 
              @click="showSuggestions = false"
              class="block w-full text-center p-2 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors bg-gray-50 border-t border-gray-100"
            >
              See all results for "{{ searchQuery }}"
            </router-link>
          </div>
        </div>

        <!-- Desktop Right Actions -->
        <div class="hidden lg:flex items-center space-x-6">
          
          <!-- Account & Lists -->
          <div class="relative" @mouseleave="isProfileOpen = false">
            <button 
              @mouseenter="isProfileOpen = true"
              class="flex flex-col items-start hover:border-white border border-transparent p-1 rounded"
            >
              <span class="text-xs text-gray-300">Hello, {{ authStore.user ? authStore.user.firstName : 'Sign in' }}</span>
              <span class="text-sm font-bold flex items-center gap-1">Account & Lists <ChevronDown :size="14"/></span>
            </button>

            <div 
              v-if="isProfileOpen"
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 150 } }"
              :leave="{ opacity: 0, y: 10, transition: { duration: 150 } }"
              class="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-2xl py-2 text-gray-800 z-50 border border-gray-200"
            >
              <template v-if="!authStore.isAuthenticated">
                <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-md">
                  <div class="text-center mb-3">
                    <router-link to="/login" class="bg-orange-400 hover:bg-orange-500 text-gray-900 font-bold py-1.5 px-8 rounded-md inline-block w-full text-sm">Sign in</router-link>
                  </div>
                  <p class="text-xs font-semibold text-gray-500 mb-2">Or Login As (Seed Users):</p>
                  <button
                    v-for="su in seededUsers"
                    :key="su.id"
                    @click="handleLoginAs(su)"
                    class="w-full text-left px-2 py-1.5 text-xs hover:bg-orange-100 rounded text-gray-700 hover:text-orange-600 font-medium flex items-center gap-2 transition-colors"
                  >
                    <User :size="12"/> {{ su.name }} ({{ su.role }})
                  </button>
                </div>
              </template>
              <template v-else>
                <div class="px-4 py-2 border-b border-gray-100 bg-gray-50">
                  <p class="text-sm font-bold truncate">{{ authStore.user.firstName }} {{ authStore.user.lastName }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ authStore.user.email }}</p>
                </div>
                <div class="py-1">
                  <router-link to="/orders" class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"><Package :size="16"/> Your Orders</router-link>
                  <router-link v-if="authStore.user.role === 'ADMIN'" to="/admin" class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-orange-600 font-medium transition-colors"><Settings :size="16"/> Admin Dashboard</router-link>
                </div>
                <div class="border-t border-gray-100 py-1">
                  <button @click="authStore.logout" class="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 transition-colors">
                    <LogOut :size="16"/> Sign Out
                  </button>
                </div>
              </template>
            </div>
          </div>

          <!-- Returns & Orders -->
          <router-link v-if="authStore.isAuthenticated" to="/orders" class="flex flex-col items-start hover:border-white border border-transparent p-1 rounded">
            <span class="text-xs text-gray-300">Returns</span>
            <span class="text-sm font-bold">& Orders</span>
          </router-link>

          <!-- Wishlist -->
          <router-link to="/wishlist" class="flex items-center hover:border-white border border-transparent p-1 rounded relative group">
            <Heart :size="24" class="text-white group-hover:text-orange-400 transition-colors"/>
            <span v-if="wishlistStore.wishlist && wishlistStore.wishlist.length > 0" class="absolute -top-1 -right-1 bg-orange-400 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
              {{ wishlistStore.wishlist.length }}
            </span>
          </router-link>

          <!-- Cart -->
          <router-link to="/cart" class="flex items-center hover:border-white border border-transparent p-1 rounded group">
            <div class="relative">
              <ShoppingCart :size="28" class="text-white group-hover:text-orange-400 transition-colors"/>
              <span class="absolute -top-2 left-3 text-orange-400 font-bold text-lg">{{ cartStore.totalItems || 0 }}</span>
            </div>
            <span class="text-sm font-bold mt-3 ml-1">Cart</span>
          </router-link>

        </div>

        <!-- Mobile Right Actions -->
        <div class="flex lg:hidden items-center gap-4">
           <router-link to="/cart" class="flex items-center relative">
              <ShoppingCart :size="24" class="text-white"/>
              <span class="absolute -top-2 -right-2 bg-orange-400 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                {{ cartStore.totalItems || 0 }}
              </span>
           </router-link>
        </div>
      </div>
    </div>
    
    <!-- Subnav / Mega Menu Trigger -->
    <div class="bg-gray-800 text-white border-t border-gray-700 hidden lg:block relative" @mouseleave="isMegaMenuOpen = false">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-10">
        <button 
          @mouseenter="isMegaMenuOpen = true"
          class="flex items-center gap-1 hover:border-white border border-transparent px-2 py-1 rounded text-sm font-bold mr-2"
        >
          <Menu :size="18"/> All Categories
        </button>
        <div class="flex gap-4 overflow-x-auto no-scrollbar text-sm font-medium">
          <router-link to="/products" class="hover:border-white border border-transparent px-2 py-1 rounded whitespace-nowrap">All Products</router-link>
          <router-link 
            v-for="cat in ['Fashion', 'Electronics', 'Home & Garden', 'Beauty']" 
            :key="cat" 
            :to="`/products?department=${encodeURIComponent(cat)}`" 
            class="hover:border-white border border-transparent px-2 py-1 rounded whitespace-nowrap capitalize"
          >
            {{ cat }}
          </router-link>
        </div>
      </div>

      <!-- Mega Menu Dropdown -->
      <div 
        v-if="isMegaMenuOpen"
        v-motion
        :initial="{ opacity: 0, y: 5 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 200 } }"
        :leave="{ opacity: 0, y: 5, transition: { duration: 200 } }"
        class="absolute top-10 left-0 w-full bg-white text-gray-900 shadow-2xl border-t border-gray-200 z-50"
      >
        <div class="max-w-7xl mx-auto px-6 py-8">
          <h3 class="text-lg font-bold border-b border-gray-200 pb-2 mb-6">Shop by Category</h3>
          <div class="grid grid-cols-4 gap-6">
            <router-link 
              v-for="cat in ['Fashion', 'Electronics', 'Home & Garden', 'Beauty']" 
              :key="cat" 
              :to="`/products?department=${encodeURIComponent(cat)}`"
              class="text-sm hover:text-orange-600 hover:underline capitalize flex items-center gap-2"
            >
              <ChevronRight :size="14" class="text-gray-400"/>
              {{ cat }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Drawer -->
    <div 
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-50 flex lg:hidden"
    >
      <!-- Backdrop -->
      <div 
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 300 } }"
        :leave="{ opacity: 0, transition: { duration: 300 } }"
        class="fixed inset-0 bg-black/60" 
        @click="isMobileMenuOpen = false"
      ></div>
      
      <!-- Drawer -->
      <div 
        v-motion
        :initial="{ opacity: 0, x: -300 }"
        :enter="{ opacity: 1, x: 0, transition: { type: 'tween', duration: 300 } }"
        :leave="{ opacity: 0, x: -300, transition: { type: 'tween', duration: 300 } }"
        class="relative w-4/5 max-w-sm bg-white h-full flex flex-col overflow-y-auto shadow-2xl text-gray-900"
      >
        <!-- Header -->
        <div class="bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-10">
          <div class="flex items-center gap-3">
            <User :size="24" :class="authStore.isAuthenticated ? 'text-orange-400' : 'text-white'"/>
            <span class="font-bold text-lg">
              {{ authStore.isAuthenticated ? `Hello, ${authStore.user.firstName}` : "Hello, sign in" }}
            </span>
          </div>
          <button @click="isMobileMenuOpen = false" class="p-1 hover:bg-gray-800 rounded">
            <X :size="24" />
          </button>
        </div>
        
        <!-- Mobile Search -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <form @submit.prevent="handleSearch" class="flex">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search AmazonPOC..."
              class="w-full px-4 py-2 text-gray-900 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button type="submit" class="px-4 py-2 bg-orange-400 hover:bg-orange-500 rounded-r-md text-gray-900 font-medium">
              <Search :size="20" />
            </button>
          </form>
        </div>

        <!-- Navigation Links -->
        <div class="flex-1 py-2">
          <div v-if="!authStore.isAuthenticated" class="px-4 py-3 border-b border-gray-200">
             <router-link to="/login" class="block text-center bg-orange-400 hover:bg-orange-500 font-bold py-2 rounded-md mb-3">Sign In</router-link>
             <p class="text-xs font-semibold text-gray-500 mb-2">Seed Users:</p>
             <div class="flex gap-2 flex-wrap">
               <button 
                 v-for="su in seededUsers" 
                 :key="su.id" 
                 @click="handleLoginAs(su)" 
                 class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-300 shadow-sm"
               >
                 {{ su.name }} ({{ su.role }})
               </button>
             </div>
          </div>

          <div class="py-2 border-b border-gray-200">
            <h3 class="px-4 py-2 text-lg font-bold text-gray-800">Shop By Department</h3>
            <router-link to="/products" class="block px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm">All Products</router-link>
            
            <!-- Category Accordion -->
            <div>
              <button 
                @click="isMobileCategoriesOpen = !isMobileCategoriesOpen"
                class="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm font-medium"
              >
                Categories
                <ChevronDown :size="16" :class="['transition-transform', { 'rotate-180': isMobileCategoriesOpen }]" />
              </button>
              <div 
                v-if="isMobileCategoriesOpen"
                v-motion
                :initial="{ height: 0, opacity: 0 }"
                :enter="{ height: 'auto', opacity: 1, transition: { duration: 300 } }"
                :leave="{ height: 0, opacity: 0, transition: { duration: 300 } }"
                class="overflow-hidden bg-gray-50"
              >
                <router-link 
                  v-for="cat in ['Fashion', 'Electronics', 'Home & Garden', 'Beauty']"
                  :key="cat" 
                  :to="`/products?department=${encodeURIComponent(cat)}`"
                  class="block px-8 py-2.5 text-gray-600 hover:bg-gray-200 text-sm capitalize border-l-2 border-transparent hover:border-orange-400"
                >
                  {{ cat }}
                </router-link>
              </div>
            </div>
          </div>

          <div class="py-2">
            <h3 class="px-4 py-2 text-lg font-bold text-gray-800">Help & Settings</h3>
            <template v-if="authStore.isAuthenticated">
              <router-link to="/orders" class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"><Package :size="18"/> Your Orders</router-link>
              <router-link to="/wishlist" class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"><Heart :size="18"/> Your Wishlist</router-link>
              <router-link v-if="authStore.user.role === 'ADMIN'" to="/admin" class="flex items-center gap-3 px-4 py-3 text-orange-600 hover:bg-gray-100 font-medium text-sm"><Settings :size="18"/> Admin Dashboard</router-link>
              <button @click="authStore.logout" class="w-full flex items-center gap-3 text-left px-4 py-3 text-red-600 hover:bg-gray-100 text-sm">
                <LogOut :size="18"/> Sign Out
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { useWishlistStore } from '../stores/wishlist';
import { Search, ShoppingCart, User, Heart, Menu, X, LogOut, Package, Settings, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-vue-next';
import api from '../services/api';

const seededUsers = [
  { id: 'user_1', name: 'John Doe', email: 'john@example.com', role: 'USER' },
  { id: 'user_2', name: 'Jane Smith', email: 'jane@example.com', role: 'USER' },
  { id: 'user_admin', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
];

const authStore = useAuthStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const router = useRouter();
const route = useRoute();

const searchQuery = ref('');
const isProfileOpen = ref(false);
const isMobileMenuOpen = ref(false);
const isMegaMenuOpen = ref(false);
const isMobileCategoriesOpen = ref(false);

const searchSuggestions = ref([]);
const showSuggestions = ref(false);
const searchContainerRef = ref(null);

watch(() => [route.path, route.query], () => {
  isMobileMenuOpen.value = false;
  isProfileOpen.value = false;
  isMegaMenuOpen.value = false;
  showSuggestions.value = false;
});

const handleClickOutside = (e) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(e.target)) {
    showSuggestions.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

let searchTimeout = null;
watch(searchQuery, (newVal) => {
  if (!newVal.trim() || newVal.length < 2) {
    searchSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const response = await api.get('/products', { params: { page: 1, limit: 5, keyword: newVal } });
      if (response.data?.products) {
        searchSuggestions.value = response.data.products;
        showSuggestions.value = true;
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  }, 300);
});

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = false;
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`);
  }
};

const handleLoginAs = async (seededUser) => {
  await authStore.login(seededUser.email, 'password123');
  isProfileOpen.value = false;
  isMobileMenuOpen.value = false;
};

const getSuggestionImage = (product) => {
  return (product.images && product.images.length > 0 && product.images[0]) || 
         product.image || 
         product.thumbnail || 
         product.thumbnailUrl || 
         'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80';
};

const formatCurrency = (minor) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((minor || 0) / 100);
};
</script>
