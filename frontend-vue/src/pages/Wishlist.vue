<template>
  <div v-if="loading" class="min-h-screen bg-white pt-24 pb-24 flex items-center justify-center">
    <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
  </div>

  <div v-else class="min-h-screen bg-white pt-24 pb-24 font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3 mb-8">
        <Heart class="w-8 h-8 text-black" fill="currentColor" />
        <h1 class="text-3xl font-black text-black tracking-tighter">Your Wishlist</h1>
      </div>

      <div v-if="products.length === 0">
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0 }"
          class="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200"
        >
          <Heart class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p class="text-gray-500 mb-6">Save items you love and buy them later.</p>
          <router-link
            to="/products"
            class="inline-block px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-900 transition-colors"
          >
            Start Shopping
          </router-link>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="product in products" :key="product._id || product.id" class="relative">
          <ProductCard :product="product" />
          <button
            @click="handleRemoveFromWishlist(product._id || product.id)"
            class="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors z-10"
            title="Remove from wishlist"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Heart, Trash2 } from 'lucide-vue-next';
import { useWishlistStore } from '../stores/wishlist';
import ProductCard from '../components/ProductCard.vue';
import api from '../services/api';
import { toast } from 'vue3-toastify';

const wishlistStore = useWishlistStore();

const products = ref([]);
const loading = ref(true);

const fetchWishlistProducts = async () => {
  loading.value = true;
  if (wishlistStore.wishlist.length === 0) {
    products.value = [];
    loading.value = false;
    return;
  }
  
  try {
    const fetchedProducts = await Promise.all(
      wishlistStore.wishlist
        .filter(id => id && typeof id === 'string' && id.length === 24) // Only valid 24-char ObjectIDs
        .map(id => 
          api.get(`/products/${id}`)
            .then(res => res.data?.data || null)
            .catch(() => null)
        )
    );
    products.value = fetchedProducts.filter(p => p !== null);
  } catch (error) {
    console.error('Failed to fetch wishlist products:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => wishlistStore.wishlist, () => {
  fetchWishlistProducts();
}, { deep: true, immediate: true });

const handleRemoveFromWishlist = (productId) => {
  wishlistStore.removeFromWishlist(productId);
  toast.success('Removed from wishlist');
};
</script>
