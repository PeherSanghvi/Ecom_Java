<template>
  <div v-if="!cartStore.cart || cartStore.cart.items.length === 0" class="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 font-sans">
    <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
      <Search class="w-10 h-10 text-gray-400" />
    </div>
    <h2 class="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Your bag is empty</h2>
    <router-link to="/products" class="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold text-sm tracking-widest uppercase rounded-full transition-all hover:bg-gray-800">
      Continue Shopping
    </router-link>
  </div>

  <div v-else class="min-h-screen py-10 font-sans bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="mb-12">
        <div class="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
          <div 
            v-for="(s, idx) in steps"
            :key="s.num"
            class="flex items-center gap-2"
            :style="{ color: step === s.num ? 'black' : step > s.num ? '#666' : '#999' }"
          >
            <div 
              class="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
              :style="{ 
                backgroundColor: step === s.num ? 'black' : step > s.num ? '#10b981' : 'transparent', 
                color: step === s.num || step > s.num ? 'white' : '#999',
                border: step === s.num ? 'none' : '1px solid #ddd'
              }"
            >
              {{ step > s.num ? '✓' : s.num }}
            </div>
            {{ s.label }}
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        
        <div class="flex-1">
          <div class="min-h-[400px]">
            
            <!-- Step 1: Shipping -->
            <div v-if="step === 1" class="pb-8">
              <h2 class="text-3xl font-black mb-8 tracking-tighter">Shipping Address</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div 
                  v-for="addr in addresses"
                  :key="addr.id"
                  @click="selectedAddressId = addr.id"
                  class="p-6 rounded-xl cursor-pointer transition-all border-2"
                  :style="{ 
                    backgroundColor: selectedAddressId === addr.id ? '#f0f9ff' : 'white', 
                    borderColor: selectedAddressId === addr.id ? 'black' : '#ddd'
                  }"
                >
                  <div class="flex justify-between items-start mb-3">
                    <h3 class="font-black text-lg">{{ addr.name }}</h3>
                    <span v-if="addr.default" class="text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-black">Default</span>
                  </div>
                  <p class="font-light leading-relaxed text-gray-700">{{ addr.address }}</p>
                  <div 
                    class="mt-4 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    :style="{ borderColor: selectedAddressId === addr.id ? 'black' : '#ddd' }"
                  >
                    <div v-if="selectedAddressId === addr.id" class="w-2.5 h-2.5 rounded-full bg-black"></div>
                  </div>
                </div>
              </div>
              <div class="flex justify-end pt-6 border-t">
                <button @click="step = 2" class="px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg transition-colors bg-black text-white hover:bg-gray-800">
                  Continue to Payment
                </button>
              </div>
            </div>

            <!-- Step 2: Payment -->
            <div v-if="step === 2" class="pb-8">
              <h2 class="text-3xl font-black mb-8 tracking-tighter">Payment Method</h2>
              <div class="space-y-4 mb-10">
                <div 
                  v-for="method in paymentMethods"
                  :key="method.id"
                  @click="selectedPaymentMethod = method.id"
                  class="p-5 rounded-xl cursor-pointer transition-all flex items-center gap-6 border-2"
                  :style="{ 
                    backgroundColor: selectedPaymentMethod === method.id ? '#f0f9ff' : 'white', 
                    borderColor: selectedPaymentMethod === method.id ? 'black' : '#ddd'
                  }"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    :style="{ borderColor: selectedPaymentMethod === method.id ? 'black' : '#ddd' }"
                  >
                    <div v-if="selectedPaymentMethod === method.id" class="w-2.5 h-2.5 rounded-full bg-black"></div>
                  </div>
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-white border border-gray-200">
                    <component :is="method.icon" class="w-5 h-5 text-black" />
                  </div>
                  <span class="font-black text-lg">{{ method.name }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center pt-6 border-t">
                <button @click="step = 1" class="text-xs font-bold uppercase tracking-widest transition-colors text-gray-600 hover:text-black">
                  Back
                </button>
                <button @click="step = 3" class="px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg transition-colors bg-black text-white hover:bg-gray-800">
                  Review Order
                </button>
              </div>
            </div>

            <!-- Step 3: Review -->
            <div v-if="step === 3" class="pb-8">
              <h2 class="text-3xl font-black mb-8 tracking-tighter">Review Order</h2>
              
              <div class="rounded-xl p-8 border mb-8 bg-white">
                <div class="flex justify-between items-start mb-6 pb-6 border-b">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-600">Shipping To</p>
                    <p class="font-black text-lg mb-1">{{ getSelectedAddress().name }}</p>
                    <p class="text-sm font-light text-gray-600">{{ getSelectedAddress().address }}</p>
                  </div>
                  <button @click="step = 1" class="text-xs font-bold uppercase tracking-widest pb-1 transition-colors text-black border-b-2 border-black">Edit</button>
                </div>
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-600">Payment Method</p>
                    <p class="font-black text-lg capitalize">{{ getPaymentMethodName() }}</p>
                  </div>
                  <button @click="step = 2" class="text-xs font-bold uppercase tracking-widest pb-1 transition-colors text-black border-b-2 border-black">Edit</button>
                </div>
              </div>

              <div v-if="error" class="px-6 py-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3 bg-red-100 text-red-700 border border-red-300">
                <AlertCircle class="w-5 h-5 shrink-0" />
                {{ error }}
              </div>

              <div class="flex justify-between items-center pt-6 border-t">
                <button @click="step = 2" class="text-xs font-bold uppercase tracking-widest transition-colors text-gray-600 hover:text-black">
                  Back
                </button>
                <button 
                  @click="handlePlaceOrder" 
                  :disabled="loading"
                  class="px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl transition-all disabled:opacity-50 flex items-center gap-3 bg-black text-white hover:bg-gray-800"
                >
                  <div v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {{ loading ? 'Processing...' : 'Place Order' }}
                  <ArrowRight v-if="!loading" class="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:w-[400px] shrink-0">
          <div class="rounded-xl p-8 sticky top-10 border bg-white">
            <h2 class="text-xl font-black mb-6 tracking-tighter">Order Items</h2>
            
            <div class="space-y-4 mb-6 max-h-[280px] overflow-y-auto pr-2">
              <div v-for="item in cartStore.cart.items" :key="item.productId" class="flex gap-4">
                <div class="w-16 h-16 rounded-lg p-2 border shrink-0 flex items-center justify-center overflow-hidden bg-gray-50">
                  <img :src="item.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'" :alt="item.title" class="w-full h-full object-contain" />
                </div>
                <div class="flex-1 flex flex-col justify-center">
                  <h4 class="text-sm font-bold line-clamp-1 mb-1">{{ item.title }}</h4>
                  <p class="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-600">Qty {{ item.quantity }}</p>
                  <p class="text-lg font-black tracking-tight">{{ formatINR(item.unitPriceCents) }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-3 mb-6 border-t pt-6">
              <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600">
                <span>Subtotal ({{ cartStore.totalItems }} items)</span>
                <span class="text-sm text-black">{{ formatINR(cartStore.subtotalCents) }}</span>
              </div>
              <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600">
                <span>Shipping</span>
                <span class="text-sm font-bold" :style="{ color: cartStore.shippingCents === 0 ? '#1E8E5A' : 'black' }">
                  {{ cartStore.shippingCents === 0 ? 'Complimentary' : formatINR(cartStore.shippingCents) }}
                </span>
              </div>
              <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600">
                <span>Tax (8%)</span>
                <span class="text-sm text-black">{{ formatINR(cartStore.taxCents) }}</span>
              </div>
            </div>
            
            <div class="flex justify-between items-end border-t pt-6">
              <span class="text-sm font-bold uppercase tracking-widest">Total</span>
              <span class="text-3xl font-black tracking-tight">{{ formatINR(cartStore.totalCents) }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, CreditCard, ShoppingBag, Search, AlertCircle } from 'lucide-vue-next';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { formatINR } from '../utils/currency';
import api from '../services/api';
import { toast } from 'vue3-toastify';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const step = ref(1);
const steps = [
  { num: 1, label: 'Shipping' },
  { num: 2, label: 'Payment' },
  { num: 3, label: 'Review' }
];

const selectedAddressId = ref('addr-1');
const selectedPaymentMethod = ref('card');
const loading = ref(false);
const error = ref(null);

const addresses = [
  { id: 'addr-1', name: 'Home', address: '123 Premium Ave, NY 10001', default: true },
  { id: 'addr-2', name: 'Office', address: '456 Business Blvd, NY 10012', default: false }
];

const paymentMethods = [
  { id: 'card', name: 'Credit / Debit Card', icon: 'CreditCard' },
  { id: 'cod', name: 'Cash on Delivery', icon: 'ShoppingBag' }
];

const getSelectedAddress = () => addresses.find(a => a.id === selectedAddressId.value) || addresses[0];

const getPaymentMethodName = () => {
  const method = paymentMethods.find(m => m.id === selectedPaymentMethod.value);
  return method ? method.name : 'Card';
};

const handlePlaceOrder = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    if (!cartStore.cart || !cartStore.cart.items || cartStore.cart.items.length === 0) {
      error.value = 'Your cart is empty';
      loading.value = false;
      return;
    }

    const customerId = authStore.user?._id || '';

    const payload = {
      customerId,
      items: cartStore.cart.items.map(i => ({
        productId: String(i.productId).trim(),
        quantity: parseInt(i.quantity, 10),
      })),
      idempotencyKey: crypto.randomUUID()
    };

    const response = await api.post('/orders', payload);
    
    const orderId = response.data.order?._id || response.data.order?.id || response.data._id || response.data.orderId;

    // Store order confirmation data for OrderSuccess page
    const selectedAddr = getSelectedAddress();
    const orderSuccessData = {
      orderId: orderId || 'N/A',
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }),
      paymentMethod: getPaymentMethodName(),
      totalAmount: cartStore.totalCents / 100,
      shippingAddress: {
        fullName: authStore.user?.firstName ? `${authStore.user.firstName} ${authStore.user.lastName || ''}`.trim() : selectedAddr.name,
        street: selectedAddr.address,
        city: 'New York',
        state: 'NY',
        pinCode: '10001',
        phone: authStore.user?.phone || '+1 555-0100',
        email: authStore.user?.email || 'customer@example.com',
      }
    };
    localStorage.setItem('lastOrderData', JSON.stringify(orderSuccessData));

    cartStore.clearCart();
    toast.success('Order placed successfully');
    router.push('/order-success');
  } catch (err) {
    console.error('Checkout error:', err);
    
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else if (err.response?.data?.error) {
      error.value = err.response.data.error;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'Failed to place order. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
