<template>
  <div v-if="loading" class="min-h-screen bg-white pt-24 flex items-center justify-center">
    <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
  </div>

  <div v-else-if="!order" class="min-h-screen bg-white pt-24 flex items-center justify-center">
    <div class="text-center">
      <p class="text-xl text-gray-500 mb-4">Order not found</p>
      <router-link to="/orders" class="text-black font-medium hover:underline">
        Return to Orders
      </router-link>
    </div>
  </div>

  <div v-else class="min-h-screen bg-white pt-24 pb-24">
    <div class="max-w-5xl mx-auto px-6 lg:px-8">
      
      <router-link to="/orders" class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors mb-8">
        <ArrowLeft class="w-4 h-4" /> Back to Orders
      </router-link>

      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
      >
        <div class="bg-gray-50 rounded-3xl p-8 mb-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 class="text-2xl font-bold mb-1">Order #{{ order._id || order.id }}</h1>
              <p class="text-gray-600 text-sm">
                Placed on {{ formatDate(order.orderDate || order.createdAt) }}
              </p>
            </div>
            <div :class="[
              'px-4 py-2 rounded-full text-sm font-semibold',
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            ]">
              {{ order.status }}
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="order.status !== 'CANCELLED'" class="relative mb-8">
            <div class="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
            <div 
              class="absolute top-1/2 left-0 h-1 bg-black -translate-y-1/2 rounded-full transition-all duration-500" 
              :style="{ width: `${getProgressPercentage()}%` }"
            ></div>
            <div class="flex justify-between relative">
              <div v-for="(step, idx) in orderSteps" :key="idx" class="flex flex-col items-center gap-2">
                <div :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all',
                  isStepCompleted(idx) ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-400'
                ]">
                  <CheckCircle v-if="isStepCompleted(idx)" class="w-5 h-5" />
                  <component v-else :is="step.icon" class="w-4 h-4" />
                </div>
                <span :class="[
                  'text-xs font-medium',
                  isCurrentStep(idx) ? 'text-black' : isStepCompleted(idx) ? 'text-gray-900' : 'text-gray-400'
                ]">
                  {{ step.label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <h2 class="text-xl font-bold mb-6">Items</h2>
            <div class="bg-gray-50 rounded-2xl overflow-hidden">
              <div v-for="(item, idx) in order.items" :key="idx" class="flex gap-4 p-6 border-b border-gray-200 last:border-b-0">
                <div class="w-20 h-20 bg-white rounded-xl p-2 shrink-0">
                  <img :src="item.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'" :alt="item.title" class="w-full h-full object-contain" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold mb-1">{{ item.title }}</h3>
                  <p class="text-sm text-gray-500 mb-2">Qty: {{ item.quantity }}</p>
                  <p class="font-bold">{{ formatINR(item.unit_price_minor || item.unitPriceCents || 0) }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-lg">{{ formatINR(item.line_total_minor || (item.unit_price_minor * item.quantity) || 0) }}</p>
                </div>
              </div>
              <div class="p-6 bg-white">
                <div class="space-y-3">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-medium">{{ formatINR(order.subtotal_minor || order.subtotalMinor || 0) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Shipping</span>
                    <span class="font-medium">{{ (order.shipping_minor || order.shippingMinor || 0) === 0 ? 'Free' : formatINR(order.shipping_minor || order.shippingMinor || 0) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Tax</span>
                    <span class="font-medium">{{ formatINR(0) }}</span>
                  </div>
                  <div class="flex justify-between pt-3 border-t border-gray-200">
                    <span class="font-bold">Total</span>
                    <span class="font-bold text-xl">{{ formatINR(order.total_minor || order.totalMinor || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <MapPin class="w-5 h-5" /> Shipping Address
              </h3>
              <div class="text-sm text-gray-600">
                <p class="font-semibold text-black mb-1">{{ order.customer?.name || order.customer?.firstName || 'Customer' }}</p>
                <p>123 Premium Avenue</p>
                <p>Suite 400</p>
                <p>New York, NY 10001</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <CreditCard class="w-5 h-5" /> Payment Method
              </h3>
              <div class="text-sm text-gray-600">
                <p class="font-semibold text-black">•••• •••• •••• 4242</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Package, MapPin, CreditCard, ArrowLeft, CheckCircle, Truck, Clock } from 'lucide-vue-next';
import { formatINR } from '../utils/currency';
import api from '../services/api';

const route = useRoute();
const order = ref(null);
const loading = ref(true);

const orderSteps = [
  { label: 'Order Placed', status: 'PENDING', icon: 'Clock' },
  { label: 'Processing', status: 'PROCESSING', icon: 'Package' },
  { label: 'Shipped', status: 'SHIPPED', icon: 'Truck' },
  { label: 'Delivered', status: 'DELIVERED', icon: 'CheckCircle' }
];

const currentStepIndex = computed(() => {
  if (!order.value) return 0;
  const idx = orderSteps.findIndex(s => s.status === order.value.status);
  return idx === -1 ? 0 : idx;
});

const isStepCompleted = (idx) => {
  return idx <= currentStepIndex.value;
};

const isCurrentStep = (idx) => {
  return idx === currentStepIndex.value;
};

const getProgressPercentage = () => {
  return (currentStepIndex.value / (orderSteps.length - 1)) * 100;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const fetchOrder = async () => {
  try {
    const orderId = route.params.id;
    const response = await api.get(`/orders/${orderId}`);
    order.value = response.data.order || response.data;
  } catch (error) {
    console.error('Failed to fetch order:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrder();
});
</script>
