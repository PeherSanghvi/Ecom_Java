<template>
  <div v-if="loading" class="min-h-screen bg-white pt-24 flex items-center justify-center">
    <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
  </div>

  <div v-else-if="error && orders.length === 0" class="min-h-screen bg-white pt-24 pb-24 flex items-center justify-center">
    <div class="text-center">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Package class="w-10 h-10 text-gray-400" />
      </div>
      <h2 class="text-2xl font-bold mb-4">Error Loading Orders</h2>
      <p class="text-gray-600 mb-8">{{ error }}</p>
      <router-link 
        to="/products" 
        class="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
      >
        Start Shopping <ArrowRight class="w-4 h-4" />
      </router-link>
    </div>
  </div>

  <div v-else-if="orders.length === 0" class="min-h-screen bg-white pt-24 pb-24 flex items-center justify-center">
    <div class="text-center">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Package class="w-10 h-10 text-gray-400" />
      </div>
      <h2 class="text-2xl font-bold mb-4">No orders yet</h2>
      <p class="text-gray-600 mb-8">Start shopping to see your orders here.</p>
      <router-link 
        to="/products" 
        class="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
      >
        Start Shopping <ArrowRight class="w-4 h-4" />
      </router-link>
    </div>
  </div>

  <div v-else class="min-h-screen bg-white pt-24 pb-24">
    <div class="max-w-4xl mx-auto px-6 lg:px-8">
      
      <h1 class="text-3xl font-bold tracking-tight mb-8">Order History</h1>

      <div class="space-y-6">
        <div 
          v-for="(order, index) in orders"
          :key="order._id || order.id || index"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0 }"
          class="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
        >
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div class="flex gap-8">
              <div>
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                <p class="font-semibold">{{ formatDate(order.order_date || order.created_at) }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                <p class="font-semibold">{{ formatINR(order.total_minor || order.totalMinor) }}</p>
              </div>
              <div class="hidden sm:block">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                <p class="font-semibold">#{{ getOrderId(order) }}</p>
              </div>
            </div>
            <router-link 
              :to="`/orders/${order._id || order.id}`" 
              class="inline-flex items-center gap-2 text-sm font-medium text-black hover:underline"
            >
              View Details <ArrowRight class="w-4 h-4" />
            </router-link>
          </div>

          <div class="flex items-center gap-3 mb-4">
            <span :class="[
              'px-3 py-1 rounded-full text-xs font-semibold',
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            ]">
              {{ order.status }}
            </span>
          </div>

          <div class="flex gap-3 overflow-x-auto">
            <div v-for="(item, idx) in (order.items || []).slice(0, 4)" :key="idx" class="shrink-0 w-16 h-16 bg-white rounded-lg p-2 border border-gray-200">
              <img :src="item.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'" :alt="item.title" class="w-full h-full object-contain" />
            </div>
            <div v-if="(order.items || []).length > 4" class="shrink-0 w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
              +{{ (order.items || []).length - 4 }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { Package, ArrowRight } from 'lucide-vue-next';
import { formatINR } from '../utils/currency';
import api from '../services/api';

const authStore = useAuthStore();
const orders = ref([]);
const loading = ref(true);
const error = ref(null);

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const getOrderId = (order) => {
  const id = order._id || order.id;
  return typeof id === 'string' ? id.slice(-8) : id;
};

const fetchOrders = async () => {
  try {
    loading.value = true;
    error.value = null;
    const userId = authStore.user?._id || authStore.user?.id;
    
    if (!userId) {
      error.value = 'User not authenticated';
      loading.value = false;
      return;
    }

    const response = await api.get(`/orders/customer/${userId}`);
    
    const ordersData = response.data?.orders || [];
    orders.value = ordersData;
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    error.value = 'Failed to load orders. Please try again.';
    orders.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (authStore.user?._id || authStore.user?.id) {
    fetchOrders();
  } else {
    loading.value = false;
    error.value = 'User not authenticated';
  }
});
</script>
