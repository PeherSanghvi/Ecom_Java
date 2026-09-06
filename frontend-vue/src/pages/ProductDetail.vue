<template>
  <div class="min-h-screen bg-white">
    <!-- 404 State -->
    <NotFound
      v-if="notFound && !loading"
      title="Product Not Found"
      message="The product you're looking for doesn't exist or has been removed."
    />

    <!-- Loading State -->
    <div
      v-else-if="loading"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1 }"
      class="min-h-screen bg-white flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-4">
        <div
          class="w-12 h-12 border-3 border-gray-200 border-t-black rounded-full animate-spin"
        ></div>
        <p class="text-gray-600 font-medium">Loading product details...</p>
      </div>
    </div>

    <template v-else-if="product">
      <!-- Breadcrumb Navigation -->
      <nav
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{ opacity: 1, y: 0 }"
        class="border-b border-gray-200 sticky top-0 z-30 bg-white"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center gap-2 text-sm">
            <button
              @click="router.push('/')"
              class="text-gray-500 hover:text-black transition-colors font-medium"
            >
              Home
            </button>
            <ChevronRight class="w-4 h-4 text-gray-400" />
            <button
              @click="router.push('/products')"
              class="text-gray-500 hover:text-black transition-colors font-medium"
            >
              Products
            </button>
            <ChevronRight class="w-4 h-4 text-gray-400" />
            <template v-if="product.category">
              <button
                @click="router.push(`/products?category=${product.category}`)"
                class="text-gray-500 hover:text-black transition-colors font-medium"
              >
                {{ product.category }}
              </button>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </template>
            <span class="text-black font-bold line-clamp-1">{{ product.title }}</span>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 500 } }"
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Left: Image Gallery -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }"
            class="lg:col-span-1"
          >
            <ImageGallery :images="getGalleryImages()" :title="product.title" />
          </div>

          <!-- Right: Product Details -->
          <div
            v-motion
            :initial="{ opacity: 0, x: 20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }"
            class="lg:col-span-2 flex flex-col"
          >
            <!-- Header Info -->
            <div class="mb-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                    {{ product.brand || 'Aura Exclusive' }}
                  </div>
                  <h1 class="text-3xl sm:text-4xl font-black text-black mb-4 leading-tight tracking-tight">
                    {{ product.title }}
                  </h1>
                  <div class="flex items-center gap-6 flex-wrap mb-6">
                    <!-- Rating -->
                    <div class="flex items-center gap-2">
                      <div class="flex items-center gap-1">
                        <Star
                          v-for="i in 5"
                          :key="i"
                          class="w-4 h-4"
                          :style="{
                            fill: i - 1 < Math.floor(rating) ? '#fbbf24' : '#e5e7eb',
                            color: i - 1 < Math.floor(rating) ? '#fbbf24' : '#e5e7eb',
                          }"
                        />
                      </div>
                      <span class="font-bold text-black">{{ rating }}</span>
                      <span class="text-sm text-gray-500">({{ reviewsCount }} reviews)</span>
                    </div>

                    <!-- Stock Status -->
                    <div class="flex items-center gap-2">
                      <template v-if="stock === 0">
                        <div class="w-2 h-2 rounded-full" style="background-color: #D14343;"></div>
                        <span class="text-sm font-semibold text-gray-700">Out of Stock</span>
                      </template>
                      <template v-else-if="stock < 10">
                        <div class="w-2 h-2 rounded-full" style="background-color: #f59e0b;"></div>
                        <span class="text-sm font-semibold text-gray-700">
                          Only {{ stock }} left
                        </span>
                      </template>
                      <template v-else>
                        <div class="w-2 h-2 rounded-full" style="background-color: #1E8E5A;"></div>
                        <span class="text-sm font-semibold text-gray-700">In Stock</span>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Wishlist Button -->
                <button
                  v-motion
                  :hovered="{ scale: 1.1 }"
                  :tapped="{ scale: 0.95 }"
                  @click="handleWishlistToggle"
                  class="p-3 rounded-full border border-gray-300 hover:border-black transition-colors ml-4"
                >
                  <Heart
                    class="w-6 h-6 transition-colors"
                    :style="{
                      fill: isWishlisted ? '#D14343' : 'none',
                      color: isWishlisted ? '#D14343' : '#666',
                    }"
                  />
                </button>
              </div>

              <!-- Category -->
              <div v-if="product.category" class="text-sm text-gray-600 mb-6">
                Category: 
                <button
                  @click="router.push(`/products?category=${product.category}`)"
                  class="font-bold text-black hover:underline"
                >
                  {{ product.category }}
                </button>
              </div>
            </div>

            <!-- Pricing -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
              class="mb-8 pb-8 border-b border-gray-200"
            >
              <div class="flex items-baseline gap-4 mb-4">
                <span class="text-4xl font-black text-black">{{ formatINR(priceCents) }}</span>
                <template v-if="discount > 0">
                  <span class="text-xl line-through text-gray-400">
                    {{ formatINR(originalPriceCents) }}
                  </span>
                  <span
                    class="text-lg font-black uppercase tracking-wider px-3 py-1 rounded-full"
                    style="background-color: #D14343; color: white;"
                  >
                    -{{ discount }}%
                  </span>
                </template>
              </div>
              <p v-if="discount > 0" class="text-sm text-gray-600">
                You save {{ formatINR(originalPriceCents - priceCents) }}
              </p>
            </div>

            <!-- Quantity Selector -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
              class="mb-8 pb-8 border-b border-gray-200"
            >
              <label class="text-xs font-black uppercase tracking-wider text-gray-500 mb-4 block">
                Quantity
              </label>
              <div class="flex items-center gap-4">
                <div class="flex items-center border border-gray-300 rounded-lg">
                  <button
                    @click="setQuantity(Math.max(1, quantity - 1))"
                    :disabled="stock === 0"
                    class="px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    :value="quantity"
                    @input="handleQuantityChange"
                    :disabled="stock === 0"
                    class="w-16 text-center font-bold text-black outline-none disabled:bg-gray-50 disabled:opacity-50"
                  />
                  <button
                    @click="setQuantity(Math.min(stock, quantity + 1))"
                    :disabled="stock === 0 || quantity >= stock"
                    class="px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <span class="text-sm text-gray-600">
                  {{ stock > 0 ? `${stock} available` : 'Out of stock' }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
              class="grid grid-cols-2 gap-4 mb-8"
            >
              <button
                v-motion
                :hovered="{ scale: 1.02 }"
                :tapped="{ scale: 0.98 }"
                @click="handleAddToCart"
                :disabled="stock === 0"
                class="py-4 px-6 rounded-lg font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 border-2 border-black text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag class="w-5 h-5" />
                Add to Cart
              </button>

              <button
                v-motion
                :hovered="{ scale: 1.02 }"
                :tapped="{ scale: 0.98 }"
                @click="handleBuyNow"
                :disabled="stock === 0"
                class="py-4 px-6 rounded-lg font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap class="w-5 h-5" />
                Buy Now
              </button>
            </div>

            <!-- Trust Badges -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
              class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-6"
            >
              <div class="flex items-start gap-3">
                <Truck class="w-5 h-5 text-black flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold text-sm text-black">Free Shipping</p>
                  <p class="text-xs text-gray-600">On orders over ₹500</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Shield class="w-5 h-5 text-black flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold text-sm text-black">Secure Payment</p>
                  <p class="text-xs text-gray-600">100% protected</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <RotateCcw class="w-5 h-5 text-black flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold text-sm text-black">Easy Returns</p>
                  <p class="text-xs text-gray-600">30 days guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Section -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500 } }"
          class="mt-16 border-t border-gray-200 pt-16"
        >
          <!-- Tab Navigation -->
          <div class="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
            <button
              v-for="tab in ['description', 'specifications']"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'pb-4 font-bold uppercase tracking-wider text-sm whitespace-nowrap transition-colors',
                activeTab === tab
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              ]"
            >
              {{ tab === 'description' ? 'Description' : 'Specifications' }}
            </button>
          </div>

          <!-- Tab Content -->
          <div
            v-motion
            :key="activeTab"
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
          >
            <div v-if="activeTab === 'description'" class="prose prose-sm max-w-none">
              <p class="text-base text-gray-700 leading-relaxed mb-6">{{ getDescription() }}</p>
              <div class="bg-gray-50 rounded-lg p-6 mt-8">
                <h3 class="font-bold text-lg text-black mb-4">Key Features</h3>
                <ul class="space-y-3">
                  <li class="flex items-start gap-3">
                    <span class="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2"></span>
                    <span class="text-gray-700">Premium quality materials and craftsmanship</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2"></span>
                    <span class="text-gray-700">Designed for modern lifestyle and durability</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2"></span>
                    <span class="text-gray-700">Expert customer service and support</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2"></span>
                    <span class="text-gray-700">Warranty and guarantee included</span>
                  </li>
                </ul>
              </div>
            </div>

            <SpecificationsList
              v-if="activeTab === 'specifications'"
              :specifications="product.specifications"
              :description="product.description"
            />
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div
        v-if="product.category"
        v-motion
        :initial="{ opacity: 0 }"
        :visibleOnce="{ opacity: 1, transition: { duration: 500 } }"
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <RelatedProducts
          :category="product.category"
          :productId="product._id || product.id"
          :limit="6"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Heart, ShoppingBag, Zap, Star, Truck, Shield, RotateCcw, ChevronRight } from 'lucide-vue-next';
import api from '../services/api';
import NotFound from '../components/NotFound.vue';
import ImageGallery from '../components/ImageGallery.vue';
import SpecificationsList from '../components/SpecificationsList.vue';
import RelatedProducts from '../components/RelatedProducts.vue';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useWishlistStore } from '../stores/wishlist';
import { formatINR, calculateDiscount } from '../utils/currency';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();

const product = ref(null);
const loading = ref(true);
const notFound = ref(false);
const quantity = ref(1);
const isWishlisted = ref(false);
const activeTab = ref('description');
const rating = computed(() => {
  if (product.value?.rating != null) return parseFloat(product.value.rating.toFixed(1));
  return parseFloat((4 + Math.random()).toFixed(1));
});
const reviewsCount = computed(() => {
  if (product.value?.reviewsCount != null) return product.value.reviewsCount;
  return Math.floor(Math.random() * 500) + 20;
});

const id = computed(() => route.params.id);

const fetchProduct = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/products/${id.value}`);
    if (response.data?.success && response.data?.data) {
      product.value = response.data.data;
      notFound.value = false;
    } else {
      notFound.value = true;
    }
  } catch (error) {
    console.error('Failed to fetch product:', error);
    notFound.value = true;
  } finally {
    loading.value = false;
  }
};

watch(id, () => {
  if (!id.value) {
    notFound.value = true;
    loading.value = false;
    return;
  }
  fetchProduct();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, { immediate: true });

watch([product, () => wishlistStore.wishlist], () => {
  if (product.value) {
    isWishlisted.value = wishlistStore.isInWishlist(product.value._id || product.value.id);
  }
}, { deep: true });

// Backend returns `stock` field (not stockQuantity)
const stock = computed(() => product.value?.stock ?? product.value?.stockQuantity ?? 0);

const priceCents = computed(() => {
  return product.value?.price_minor ?? product.value?.effectivePriceCents ?? product.value?.priceCents ?? 0;
});

// The API has no separate MRP/original-price field.
// Only show a discount when the product has an explicit mrp or compareAtPrice.
// Otherwise treat originalPrice === effectivePrice (no discount).
const originalPriceCents = computed(() => {
  return product.value?.mrp ?? product.value?.compareAtPrice ?? priceCents.value;
});

const discount = computed(() => {
  return calculateDiscount(originalPriceCents.value, priceCents.value);
});

const getDescription = () => {
  const raw = product.value?.description;
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
};

const getGalleryImages = () => {
  const images = [];
  const p = product.value;
  
  if (p?.images && Array.isArray(p.images) && p.images.length > 0) {
    images.push(...p.images);
  } else if (typeof p?.images === 'string') {
    try {
      const parsed = JSON.parse(p.images.replace(/'/g, '"'));
      if (Array.isArray(parsed) && parsed.length > 0) images.push(...parsed);
      else images.push(p.images);
    } catch {
      images.push(p.images);
    }
  }

  if (p?.thumbnail && !images.includes(p.thumbnail)) images.push(p.thumbnail);
  if (p?.thumbnailUrl && !images.includes(p.thumbnailUrl)) images.push(p.thumbnailUrl);
  
  if (p?.image) {
    if (typeof p.image === 'string' && !images.includes(p.image)) images.push(p.image);
    else if (Array.isArray(p.image)) {
      p.image.forEach(img => { if (!images.includes(img)) images.push(img) });
    }
  }

  if (images.length === 0) {
    const dept = (p?.department || p?.category || '').toLowerCase();
    if (dept.includes('electronics')) images.push('https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600');
    else if (dept.includes('home')) images.push('https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600');
    else if (dept.includes('beauty')) images.push('https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600');
    else images.push('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600');
  }
  
  return [...new Set(images.filter(Boolean))];
};

const setQuantity = (val) => {
  quantity.value = val;
};

const handleQuantityChange = (e) => {
  const val = parseInt(e.target.value);
  if (isNaN(val)) return;
  setQuantity(Math.min(stock.value, Math.max(1, val)));
};

const handleAddToCart = () => {
  if (stock.value === 0) return;
  cartStore.addToCart(product.value, quantity.value);
  toast.success('Added to cart');
  setQuantity(1);
};

const handleBuyNow = () => {
  if (!authStore.isAuthenticated) {
    router.push({ path: '/login', query: { from: '/checkout' } });
    return;
  }
  if (stock.value === 0) return;
  cartStore.addToCart(product.value, quantity.value);
  router.push('/checkout');
};

const handleWishlistToggle = () => {
  if (isWishlisted.value) {
    wishlistStore.removeFromWishlist(product.value._id || product.value.id);
    toast.success('Removed from wishlist');
  } else {
    wishlistStore.addToWishlist(product.value);
    toast.success('Added to wishlist');
  }
};
</script>
