<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 font-sans py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Success Animation -->
      <div
        v-motion
        :initial="{ scale: 0, opacity: 0 }"
        :enter="{ scale: 1, opacity: 1 }"
        class="flex justify-center mb-12"
      >
        <div class="relative w-24 h-24">
          <div
            v-motion
            :animate="{ rotate: 360 }"
            class="absolute inset-0"
          >
            <div class="w-full h-full rounded-full border-4 border-transparent border-t-green-600 border-r-green-600" />
          </div>
          <div class="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 class="w-16 h-16 text-green-600" />
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
        class="bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-12 text-white text-center">
          <h1 class="text-4xl font-black tracking-tighter mb-2">Order Confirmed!</h1>
          <p class="text-lg font-light">Thank you for your purchase</p>
        </div>

        <!-- Content -->
        <div class="p-8 lg:p-12 space-y-12">
          
          <!-- Order ID -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1 }"
            class="text-center border-b border-gray-200 pb-8"
          >
            <p class="text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Order Number</p>
            <p class="text-3xl font-black text-black tracking-tight font-mono">#{{ orderData?.orderId }}</p>
            <p class="text-sm text-gray-600 mt-4">
              Order placed on {{ orderData?.date }}
            </p>
          </div>

          <!-- Key Details Grid -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1 }"
            class="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            
            <!-- Shipping Address -->
            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <MapPin class="w-5 h-5 text-blue-600" />
                </div>
                <h3 class="text-lg font-black text-black">Shipping Address</h3>
              </div>
              <div class="space-y-2 text-sm text-gray-700">
                <p class="font-bold">{{ orderData?.shippingAddress?.fullName }}</p>
                <p>{{ orderData?.shippingAddress?.street }}</p>
                <p>
                  {{ orderData?.shippingAddress?.city }}, {{ orderData?.shippingAddress?.state }}
                  {{ orderData?.shippingAddress?.pinCode }}
                </p>
                <p class="pt-2 border-t border-blue-300 mt-2">
                  📞 {{ orderData?.shippingAddress?.phone }}
                </p>
                <p>📧 {{ orderData?.shippingAddress?.email }}</p>
              </div>
            </div>

            <!-- Order Details -->
            <div class="space-y-4">
              
              <!-- Estimated Delivery -->
              <div class="bg-green-50 rounded-xl p-6 border border-green-200">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                    <Truck class="w-5 h-5 text-green-600" />
                  </div>
                  <h3 class="text-lg font-black text-black">Estimated Delivery</h3>
                </div>
                <p class="text-sm text-gray-600 mb-2">Your order will arrive by</p>
                <p class="text-xl font-black text-green-600">{{ orderData?.estimatedDelivery }}</p>
              </div>

              <!-- Payment Method -->
              <div class="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                    <CreditCard class="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 class="text-lg font-black text-black">Payment Method</h3>
                </div>
                <p class="text-sm font-bold text-purple-600">{{ orderData?.paymentMethod }}</p>
              </div>

            </div>
          </div>

          <!-- Order Amount -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1 }"
            class="bg-gray-50 rounded-xl p-6 border border-gray-200"
          >
            <div class="flex justify-between items-center">
              <span class="font-bold text-black text-lg">Total Amount Payable</span>
              <span class="text-4xl font-black text-black">
                ₹{{ Math.round(orderData?.totalAmount || 0).toLocaleString('en-IN') }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1 }"
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8"
          >
            <router-link
              to="/orders"
              class="px-8 py-4 border-2 border-black text-black font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-black hover:text-white flex items-center justify-center gap-2 text-center"
            >
              View My Orders
            </router-link>
            <router-link
              to="/products"
              class="px-8 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-gray-900 flex items-center justify-center gap-2 text-center"
            >
              Continue Shopping <ChevronRight class="w-5 h-5" />
            </router-link>
          </div>

          <!-- Info Box -->
          <div class="bg-blue-50 rounded-xl p-6 border border-blue-200 flex gap-4">
            <div class="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-sm font-bold text-blue-600">!</span>
            </div>
            <div>
              <p class="text-sm font-bold text-blue-900 mb-1">Next Steps</p>
              <p class="text-sm text-blue-800">
                A confirmation email has been sent to {{ orderData?.shippingAddress?.email }}.
                You can track your order from the "My Orders" page.
              </p>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        class="text-center mt-12"
      >
        <p class="text-sm text-gray-600 font-light">
          Need help? <button class="text-blue-600 font-bold hover:underline">Contact Support</button>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle2, MapPin, CreditCard, Truck, ChevronRight } from 'lucide-vue-next';

const router = useRouter();

// Read order data from localStorage (set by Checkout.vue after successful order)
const stored = localStorage.getItem('lastOrderData');
const orderData = ref(stored ? JSON.parse(stored) : null);

onMounted(() => {
  if (!orderData.value) {
    router.push('/');
    return;
  }
  // Clear after reading so the page doesn't persist stale data on re-visit
  localStorage.removeItem('lastOrderData');
});
</script>
