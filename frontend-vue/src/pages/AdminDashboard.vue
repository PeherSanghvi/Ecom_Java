<template>
  <div class="space-y-8 font-sans pb-10">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[50vh]">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 rounded-xl text-sm font-bold flex items-center gap-3 bg-red-50 text-red-600 border border-red-200">
      <AlertCircle class="w-5 h-5 shrink-0" />
      {{ error }}
    </div>

    <template v-else>
      <!-- KPI Section -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0 }"
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div class="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
            <DollarSign class="w-6 h-6" />
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Account Balance</p>
          <p class="text-3xl font-black text-black tracking-tighter">{{ formatINR(balanceCents) }}</p>
          <p class="text-xs font-bold text-gray-400 mt-2">After 10% service charge</p>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ delay: 100 }"
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <TrendingUp class="w-6 h-6" />
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Revenue</p>
          <p class="text-3xl font-black text-black tracking-tighter">{{ formatINR(data.totalRevenueCents) }}</p>
          <p class="text-xs font-bold text-gray-400 mt-2">Gross revenue</p>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ delay: 200 }"
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <ShoppingBag class="w-6 h-6" />
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Orders</p>
          <p class="text-3xl font-black text-black tracking-tighter">{{ data.totalOrders }}</p>
          <p class="text-xs font-bold text-gray-400 mt-2">All time</p>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ delay: 300 }"
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div class="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <Package class="w-6 h-6" />
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Products</p>
          <p class="text-3xl font-black text-black tracking-tighter">{{ data.totalProducts }}</p>
          <p class="text-xs font-bold text-gray-400 mt-2">Active items</p>
        </div>
      </div>

      <!-- Top Products & Recent Orders -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Top Selling Products -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ delay: 400 }"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        >
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-black tracking-tighter flex items-center gap-2">
              <Star class="w-5 h-5 text-yellow-500 fill-yellow-500" /> Top Selling Products
            </h3>
            <router-link to="/products" class="text-xs font-bold flex items-center gap-1 text-black hover:underline">
              View all <ArrowRight class="w-3 h-3" />
            </router-link>
          </div>
          <div class="divide-y divide-gray-50 flex-1">
            <div v-if="data.topSellingProducts.length === 0" class="p-8 text-center text-gray-400 font-bold text-sm">
              No products yet
            </div>
            <div 
              v-for="product in data.topSellingProducts" 
              :key="product._id" 
              class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img :src="product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/150'" :alt="product.title" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-black text-sm truncate">{{ product.title }}</p>
                <p class="text-xs font-medium text-gray-500 mt-1">{{ product.category }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="font-black text-black text-sm">{{ formatINR(product.price_minor || 0) }}</p>
                <p class="text-xs font-bold text-gray-400 mt-1">Rating: {{ product.rating != null ? product.rating : 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ delay: 500 }"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        >
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-black tracking-tighter flex items-center gap-2">
              <ShoppingBag class="w-5 h-5 text-purple-500" /> Recent Orders
            </h3>
            <router-link to="/admin/orders" class="text-xs font-bold flex items-center gap-1 text-black hover:underline">
              View all <ArrowRight class="w-3 h-3" />
            </router-link>
          </div>
          <div class="divide-y divide-gray-50 flex-1">
            <div v-if="data.recentOrders.length === 0" class="p-8 text-center text-gray-400 font-bold text-sm">
              No orders yet
            </div>
            <router-link 
              v-for="order in data.recentOrders" 
              :key="order.id || order.orderId"
              :to="`/admin/orders/${order.id || order.orderId}`"
              class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p class="font-bold text-black text-sm">Order #{{ order.id || order.orderId }}</p>
                <p class="text-xs font-medium text-gray-500 mt-1">{{ order.customer?.name || order.customer?.firstName }}</p>
              </div>
              <div class="text-right">
                <p class="font-black text-black text-sm">{{ formatINR(order.totalCents || order.totalMinor) }}</p>
                <span :class="[
                  'inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest',
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                ]">
                  {{ order.status }}
                </span>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Latest Products -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0 }"
        :transition="{ delay: 600 }"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
      >
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-black tracking-tighter flex items-center gap-2">
            <Package class="w-5 h-5 text-blue-500" /> Latest Products
          </h3>
          <router-link to="/products" class="text-xs font-bold flex items-center gap-1 text-black hover:underline">
            View all <ArrowRight class="w-3 h-3" />
          </router-link>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-if="data.latestProducts.length === 0" class="p-8 text-center text-gray-400 font-bold text-sm">
            No products yet
          </div>
          <div 
            v-for="product in data.latestProducts.slice(0, 5)" 
            :key="product._id" 
            class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img :src="product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/150'" :alt="product.title" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-black text-sm truncate">{{ product.title }}</p>
              <p class="text-xs font-medium text-gray-500 mt-1">{{ product.category }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-black text-black text-sm">{{ formatINR(product.price_minor || 0) }}</p>
              <p class="text-xs font-bold text-gray-400 mt-1">Stock: {{ product.stock ?? 0 }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { DollarSign, ShoppingBag, Package, TrendingUp, AlertCircle, ArrowRight, Star } from 'lucide-vue-next';
import { formatINR } from '../utils/currency';
import { useAdminStore } from '../stores/admin';
import api from '../services/api';

const adminStore = useAdminStore();

const data = ref({
  totalRevenueCents: 0,
  totalOrders: 0,
  totalProducts: 0,
  recentOrders: [],
  latestProducts: [],
  topSellingProducts: []
});

const loading = ref(true);
const error = ref(null);

const balanceCents = computed(() => {
  return Math.round(data.value.totalRevenueCents * 0.9);
});

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = null;

  // Run all three fetches in parallel; individual failures degrade gracefully
  const [ordersResult, productsResult, topProductsResult] = await Promise.allSettled([
    api.post('/search/orders', { page: 0, size: 5, sortBy: 'order_date', sortDir: 'desc' }),
    api.get('/products', { params: { page: 1, limit: 5, sortBy: 'createdAt', order: 'desc' } }),
    api.get('/products', { params: { page: 1, limit: 5, sortBy: 'rating', order: 'desc' } }),
  ]);

  const ordersData = ordersResult.status === 'fulfilled' ? ordersResult.value.data : {};
  const productsData = productsResult.status === 'fulfilled' ? productsResult.value.data : {};
  const topProductsData = topProductsResult.status === 'fulfilled' ? topProductsResult.value.data : {};

  if (ordersResult.status === 'rejected') {
    console.error('Orders fetch failed:', ordersResult.reason?.response?.status, ordersResult.reason?.message);
  }
  if (productsResult.status === 'rejected') {
    console.error('Products fetch failed:', productsResult.reason?.message);
  }

  data.value = {
    totalRevenueCents: ordersData.totalRevenue || ordersData.totalRevenueCents || 0,
    totalOrders: ordersData.totalHits || 0,
    totalProducts: productsData.pagination?.totalItems || productsData.data?.length || 0,
    recentOrders: ordersData.orders || ordersData.data || [],
    latestProducts: productsData.data || [],
    topSellingProducts: topProductsData.data || [],
  };

  loading.value = false;
};

onMounted(async () => {
  // Wait for the admin store to finish restoring token from localStorage
  // before making any authenticated requests.
  if (!adminStore.isInitialized) {
    await adminStore.initializeAdmin();
  }
  fetchDashboardData();
});
</script>
