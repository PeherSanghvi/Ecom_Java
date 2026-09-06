<template>
  <div 
    v-motion
    :initial="{ y: 0 }"
    :hovered="{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 30 } }"
    class="group relative overflow-hidden flex flex-col h-full transition-all duration-500 font-sans"
    style="background-color: var(--surface); border-radius: var(--radius-card); border: 1px solid var(--border); box-shadow: var(--shadow-soft);"
  >
    <!-- Badges -->
    <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <span v-if="discount > 0" class="text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md" style="background-color: var(--accent-cta);">
        -{{ discount }}% OFF
      </span>
      <span v-if="stockQty === 0" class="text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md" style="background-color: var(--danger);">
        Out of Stock
      </span>
      <span v-else-if="stockQty < 10" class="text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md" style="background-color: var(--status-pending);">
        Low Stock ({{ stockQty }})
      </span>
      <span v-else class="text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md" style="background-color: var(--success);">
        In Stock ({{ stockQty }})
      </span>
    </div>

    <!-- Wishlist Button -->
    <button 
      @click="handleWishlistToggle"
      class="absolute top-4 right-4 z-10 p-2.5 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 translate-x-2 group-hover:translate-x-0"
      :style="{ backgroundColor: 'rgba(255,255,255,0.9)', color: isWishlisted ? 'var(--accent-cta)' : 'var(--text-secondary)' }"
    >
      <Heart :class="['w-5 h-5', { 'fill-current': isWishlisted }]" />
    </button>

    <!-- Image Container -->
    <router-link :to="`/products/${product._id || product.id}`" class="relative h-64 overflow-hidden flex items-center justify-center p-6" style="background-color: var(--bg-base);">
      <img
        :src="imageUrl"
        :alt="product.title"
        class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <!-- Quick actions overlay -->
      <div class="absolute inset-x-4 bottom-4 flex gap-2 translate-y-16 group-hover:translate-y-0 transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100">
         <button @click="handleAddToCart" :disabled="stockQty === 0" class="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style="background-color: var(--surface); color: var(--text-primary);">
           <ShoppingBag class="w-4 h-4" /> Add
         </button>
         <button @click="handleBuyNow" :disabled="stockQty === 0" class="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style="background-color: var(--accent-cta); color: white;">
           <Zap class="w-4 h-4" /> Buy
         </button>
      </div>
    </router-link>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1 relative z-10" style="background-color: var(--surface);">
      <div class="flex items-center justify-between mb-2">
        <div class="text-[10px] font-black uppercase tracking-[0.2em]" style="color: var(--text-secondary);">
          {{ product.brand || 'AURA Exclusive' }}
        </div>
        <div class="flex items-center gap-1">
          <Star class="w-3.5 h-3.5" style="fill: #fbbf24; color: #fbbf24;" />
          <span class="text-xs font-bold" style="color: var(--text-primary);">{{ rating }}</span>
          <span class="text-[10px]" style="color: var(--text-secondary);">({{ reviewsCount }})</span>
        </div>
      </div>
      
      <router-link :to="`/products/${product._id || product.id}`">
        <h3 class="font-bold text-base mb-3 line-clamp-1 leading-tight transition-colors" style="color: var(--text-primary);">
          {{ product.title }}
        </h3>
      </router-link>
      
      <p class="text-xs line-clamp-2 mb-3" style="color: var(--text-secondary);">
        {{ description }}
      </p>
      
      <div class="mt-auto pt-4 border-t flex items-end justify-between" style="border-color: var(--border);">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold uppercase tracking-wider mb-1" style="color: var(--text-secondary);">Price</span>
          <div class="flex items-baseline gap-2">
            <span class="text-xl font-black tracking-tight text-tabular" style="color: var(--text-primary);">{{ formatINR(priceCents) }}</span>
            <span v-if="discount > 0" class="text-sm font-bold line-through" style="color: var(--text-secondary);">{{ formatINR(originalPriceCents) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useWishlistStore } from '../stores/wishlist';
import { Heart, ShoppingBag, Zap, Star } from 'lucide-vue-next';
import { formatINR, calculateDiscount } from '../utils/currency';
import { toast } from 'vue3-toastify';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();

const isWishlisted = ref(false);

const checkWishlist = () => {
  isWishlisted.value = wishlistStore.isInWishlist(props.product._id || props.product.id);
};

onMounted(checkWishlist);
watch(() => wishlistStore.wishlist, checkWishlist, { deep: true });
watch(() => props.product, checkWishlist, { deep: true });

const priceCents = computed(() => props.product.price_minor ?? props.product.effectivePriceCents ?? props.product.priceCents ?? 0);
const originalPriceCents = computed(() => props.product.priceCents ? props.product.priceCents : Math.round(priceCents.value * 1.2));
const discount = computed(() => calculateDiscount(originalPriceCents.value, priceCents.value));
// Backend returns `stock` field (not stockQuantity)
const stockQty = computed(() => props.product.stock ?? props.product.stockQuantity ?? 0);

const description = computed(() => {
  const raw = props.product.description;
  if (!raw) return 'Premium quality product from our curated collection.';
  
  if (typeof raw !== 'string') {
    if (Array.isArray(raw)) {
      const details = raw.find(x => x && x["Product Details"]);
      if (details) return details["Product Details"];
      return Object.values(raw[0] || {})[0] || 'Premium quality product from our curated collection.';
    }
    return 'Premium quality product from our curated collection.';
  }

  try {
    const parsed = JSON.parse(raw.replace(/'/g, '"'));
    if (Array.isArray(parsed) && parsed.length > 0) {
      const details = parsed.find(x => x && x["Product Details"]);
      if (details) return details["Product Details"];
      return Object.values(parsed[0] || {})[0] || 'Premium quality product from our curated collection.';
    }
  } catch {
    const match = raw.match(/['"]Product Details['"]\s*:\s*['"](.*?)['"]\s*}/i);
    if (match && match[1]) return match[1];

    if (raw.includes('[') || raw.includes('{')) {
      let stripped = raw.replace(/[\[\]{}"]/g, '');
      stripped = stripped.replace(/'Product Details':/gi, '').trim();
      if (stripped.startsWith("'") && stripped.endsWith("'")) {
        stripped = stripped.slice(1, -1);
      }
      return stripped || 'Premium quality product from our curated collection.';
    }
  }
  return raw;
});

// Stable fallback so Math.random() is not re-evaluated on every render.
// In Vue setup, variables outside computed will be stable per component instance.
const rating = props.product.rating || parseFloat((4 + Math.random()).toFixed(1));
const reviewsCount = props.product.reviewsCount || Math.floor(Math.random() * 500) + 20;

const handleWishlistToggle = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (isWishlisted.value) {
    wishlistStore.removeFromWishlist(props.product._id || props.product.id);
    toast.success('Removed from wishlist');
  } else {
    wishlistStore.addToWishlist(props.product);
    toast.success('Added to wishlist');
  }
};

const handleAddToCart = (e) => {
  e.preventDefault();
  e.stopPropagation();
  cartStore.addToCart(props.product, 1);
  toast.success('Added to cart');
};

const handleBuyNow = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!authStore.isAuthenticated) {
    router.push({ path: '/login', query: { from: '/checkout' } });
    return;
  }
  cartStore.addToCart(props.product, 1);
  router.push('/checkout');
};

const imageUrl = computed(() => {
  const p = props.product;
  const dept = (p.department || p.category || '').toLowerCase();
  
  if (p.images && p.images.length > 0 && p.images[0]) return p.images[0];
  if (p.image) return p.image;
  if (p.thumbnail) return p.thumbnail;
  if (p.thumbnailUrl) return p.thumbnailUrl;
  
  if (dept.includes('electronics')) return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600';
  if (dept.includes('home')) return 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600';
  if (dept.includes('beauty')) return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600';
  
  return 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600';
});
</script>
