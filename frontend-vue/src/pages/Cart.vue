<template>
  <div v-if="loading" class="flex items-center justify-center min-h-[70vh]">
    <div class="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
  </div>

  <div v-else-if="!cart || cart.items.length === 0" class="bg-white min-h-[70vh] flex items-center justify-center py-12 px-4 font-sans">
    <div 
      v-motion
      :initial="{ opacity: 0, y: 20 }" 
      :enter="{ opacity: 1, y: 0 }"
      class="max-w-2xl w-full text-center"
    >
      <div class="w-40 h-40 mx-auto mb-10 bg-gray-50 rounded-full flex items-center justify-center">
        <ShoppingBag class="w-16 h-16 text-gray-300" />
      </div>
      <h1 class="text-4xl font-black text-black mb-6 tracking-tighter">Your bag is empty.</h1>
      <p class="text-gray-500 mb-10 max-w-md mx-auto text-lg font-light">Explore our curated collection and discover your next favorite item.</p>
      <router-link to="/products" class="inline-block px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-900 transition-colors">
        Explore Collection
      </router-link>
    </div>
  </div>

  <div v-else class="bg-white min-h-screen py-16 font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="flex items-end justify-between mb-12 border-b border-gray-100 pb-8">
        <h1 class="text-5xl font-black text-black tracking-tighter">Review Bag</h1>
        <button @click="clearCart" class="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
          Clear All
        </button>
      </div>
      
      <div class="flex flex-col xl:flex-row gap-16">
        
        <!-- Left Column: Cart Items -->
        <div class="flex-1">
          <div class="divide-y divide-gray-100 border-t border-gray-100">
            <TransitionGroup name="list">
              <div 
                v-for="item in cart.items"
                :key="item.productId"
                v-motion
                :initial="{ opacity: 0, x: -20 }"
                :enter="{ opacity: 1, x: 0 }"
                class="py-8 flex flex-col sm:flex-row gap-8 group"
              >
                <router-link :to="`/products/${item.productId}`" class="shrink-0 w-full sm:w-40 h-48 bg-gray-50 rounded-[2rem] p-4 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-100 transition-colors">
                  <img
                    :src="item.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'"
                    :alt="item.title"
                    class="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                </router-link>
                
                <div class="flex-1 flex flex-col justify-between py-2">
                  <div class="flex justify-between items-start gap-4">
                    <div>
                      <div class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{{ item.brand || 'AURA Exclusive' }}</div>
                      <router-link :to="`/products/${item.productId}`">
                        <h3 class="text-2xl font-black text-black hover:text-gray-600 transition-colors leading-tight line-clamp-2 mb-3 tracking-tighter">
                          {{ item.title }}
                        </h3>
                      </router-link>
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        In Stock
                      </p>
                    </div>
                    <div class="text-right shrink-0">
                      <div class="text-sm font-semibold text-gray-500 mb-2">Unit Price</div>
                      <span class="text-2xl font-black text-black tracking-tight">{{ formatINR(item.unitPriceCents) }}</span>
                      <div class="text-xs font-semibold text-gray-500 mt-2">Subtotal: {{ formatINR(item.unitPriceCents * item.quantity) }}</div>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between mt-8">
                    <div class="flex items-center bg-gray-50 rounded-xl h-12 px-1 border border-gray-100">
                      <button 
                        @click="updateCartItem(item.productId, Math.max(1, item.quantity - 1))"
                        class="w-10 h-10 rounded-lg hover:bg-white flex items-center justify-center text-black font-black transition-colors"
                      >
                        <Minus class="w-3 h-3" />
                      </button>
                      <span class="w-12 text-center font-black text-sm text-black">{{ item.quantity }}</span>
                      <button 
                        @click="updateCartItem(item.productId, item.quantity + 1)"
                        class="w-10 h-10 rounded-lg hover:bg-white flex items-center justify-center text-black font-black transition-colors"
                      >
                        <Plus class="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div class="flex items-center gap-6">
                      <button 
                        @click="removeFromCart(item.productId)"
                        class="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2"
                      >
                        <X class="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
          
          <div class="mt-8 bg-gray-50 rounded-[2rem] p-8 flex items-start gap-6 border border-gray-100">
            <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-black shrink-0 border border-gray-100">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-black text-black text-lg mb-2">Complimentary Priority Shipping</h4>
              <p class="text-sm font-light text-gray-500">Order today to receive your items by {{ deliveryDate }}.</p>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Summary -->
        <div class="xl:w-[450px] shrink-0">
          <div class="bg-gray-50 rounded-[2rem] p-10 sticky top-32 border border-gray-100">
            <h2 class="text-2xl font-black text-black mb-10 tracking-tighter">Order Summary</h2>
            
            <div class="space-y-6 mb-10 border-b border-gray-200 pb-10">
              <div class="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                <span>Subtotal ({{ totalItems }} items)</span>
                <span class="text-black">{{ formatINR(subtotalCents) }}</span>
              </div>
              <div class="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                <span>Shipping</span>
                <span class="text-black font-bold text-green-600">{{ shippingCents === 0 ? 'Complimentary' : formatINR(shippingCents) }}</span>
              </div>
              <div class="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                <span>Tax (8%)</span>
                <span class="text-black">{{ formatINR(taxCents) }}</span>
              </div>
            </div>

            <!-- Promo Code -->
            <div class="mb-10">
              <div class="flex gap-3">
                <div class="relative flex-1">
                  <Tag class="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Promo Code" class="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-black transition-all uppercase placeholder:normal-case" />
                </div>
                <button class="bg-black text-white px-6 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">Apply</button>
              </div>
            </div>
            
            <div class="flex justify-between items-end mb-10">
              <span class="text-sm font-bold uppercase tracking-widest text-black">Total</span>
              <span class="text-5xl font-black text-black tracking-tighter">{{ formatINR(totalCents) }}</span>
            </div>
            
            <button 
              @click="handleCheckout"
              class="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all hover:bg-gray-900 shadow-xl flex items-center justify-center gap-3 mb-6"
            >
              Proceed to Checkout <ArrowRight class="w-4 h-4" />
            </button>
            
            <p class="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center justify-center gap-2">
              <Lock class="w-3 h-3" />
              Secure Encrypted Transaction
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ShoppingBag, X, Minus, Plus, ArrowRight, Lock, ShieldCheck, Tag } from 'lucide-vue-next';
import { useCartStore } from '../stores/cart';
import { formatINR } from '../utils/currency';
import { toast } from 'vue3-toastify';

const router = useRouter();
const cartStore = useCartStore();

const loading = ref(false);

const cart = computed(() => cartStore.cart);
const totalItems = computed(() => cartStore.totalItems);
const subtotalCents = computed(() => cartStore.subtotalCents);
const shippingCents = computed(() => cartStore.shippingCents);
const taxCents = computed(() => cartStore.taxCents);
const totalCents = computed(() => cartStore.totalCents);

const deliveryDate = computed(() => {
  const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
});

const updateCartItem = (productId, quantity) => {
  cartStore.updateCartItem(productId, quantity);
  toast.success('Cart updated');
};

const removeFromCart = (productId) => {
  cartStore.removeFromCart(productId);
  toast.success('Item removed from cart');
};

const clearCart = () => {
  cartStore.clearCart();
  toast.success('Cart cleared');
};

const handleCheckout = () => {
  router.push('/checkout');
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
