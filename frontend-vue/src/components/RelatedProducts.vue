<template>
  <div v-if="loading" class="py-16 border-t border-gray-200 mt-16">
    <h2 class="text-3xl font-black text-black mb-8 uppercase tracking-tight">
      Related Products
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <SkeletonCard v-for="i in limit" :key="i" />
    </div>
  </div>

  <section
    v-else-if="products.length > 0"
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500 } }"
    class="py-16 border-t border-gray-200 mt-16"
  >
    <!-- Header -->
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :visibleOnce="{ opacity: 1, transition: { staggerChildren: 50, delayChildren: 100 } }"
      class="mb-8"
    >
      <h2
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        class="text-3xl sm:text-4xl font-black text-black mb-2 uppercase tracking-tight"
      >
        Related Products
      </h2>
      <p
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        class="text-gray-600 text-sm font-medium"
      >
        Explore more items in the {{ category }} category
      </p>
    </div>

    <!-- Products Carousel -->
    <div class="relative group">
      <!-- Scroll Container -->
      <div
        ref="scrollContainerRef"
        @scroll="handleScroll"
        v-motion
        :initial="{ opacity: 0 }"
        :visibleOnce="{ opacity: 1, transition: { duration: 500 } }"
        class="flex gap-6 overflow-x-auto scroll-smooth pb-4 -mx-4 px-4"
        style="scroll-behavior: smooth;"
      >
        <div
          v-for="(product, index) in products"
          :key="product._id || product.id"
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :visibleOnce="{ opacity: 1, scale: 1, transition: { delay: index * 50 } }"
          class="flex-shrink-0 w-80"
        >
          <ProductCard :product="product" />
        </div>
      </div>

      <!-- Left Scroll Button -->
      <button
        v-if="canScrollLeft"
        @click="scroll('left')"
        class="absolute -left-5 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white shadow-lg border border-gray-200 hover:border-black transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
        aria-label="Scroll left"
      >
        <ChevronLeft class="w-5 h-5 text-black" />
      </button>

      <!-- Right Scroll Button -->
      <button
        v-if="canScrollRight"
        @click="scroll('right')"
        class="absolute -right-5 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white shadow-lg border border-gray-200 hover:border-black transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
        aria-label="Scroll right"
      >
        <ChevronRight class="w-5 h-5 text-black" />
      </button>

      <!-- Gradient Fade (Right) -->
      <div
        v-if="canScrollRight"
        class="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-5 rounded-r-lg"
      ></div>
    </div>

    <!-- View All Button -->
    <div
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 400, delay: 300 } }"
      class="mt-10 text-center"
    >
      <a
        :href="`/products?category=${encodeURIComponent(category)}`"
        class="inline-block px-8 py-3 border-2 border-black text-black font-bold uppercase tracking-wider rounded-lg hover:bg-black hover:text-white transition-all"
      >
        View All in {{ category }}
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import api from '../services/api';
import ProductCard from './ProductCard.vue';
import SkeletonCard from './SkeletonCard.vue';

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    default: 6
  }
});

const products = ref([]);
const loading = ref(true);
const scrollPosition = ref(0);
const scrollContainerRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const fetchRelatedProducts = async () => {
  loading.value = true;
  try {
    const response = await api.get('/products', {
      params: {
        category: props.category,
        page: 1,
        limit: props.limit + 2,
      },
    });

    if (response.data?.data) {
      const filtered = response.data.data.filter(
        (p) => (p._id || p.id) !== props.productId
      );
      products.value = filtered.slice(0, props.limit);
    }
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    products.value = [];
  } finally {
    loading.value = false;
    nextTick(updateScrollButtons);
  }
};

watch([() => props.category, () => props.productId], () => {
  fetchRelatedProducts();
});

onMounted(() => {
  fetchRelatedProducts();
});

const scroll = (direction) => {
  if (!scrollContainerRef.value) return;

  const scrollAmount = 320;
  const currentScroll = scrollContainerRef.value.scrollLeft;

  scrollContainerRef.value.scrollTo({
    left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
    behavior: 'smooth',
  });
};

const handleScroll = () => {
  if (scrollContainerRef.value) {
    scrollPosition.value = scrollContainerRef.value.scrollLeft;
    updateScrollButtons();
  }
};

const updateScrollButtons = () => {
  if (scrollContainerRef.value) {
    canScrollLeft.value = scrollPosition.value > 0;
    canScrollRight.value =
      scrollPosition.value < scrollContainerRef.value.scrollWidth - scrollContainerRef.value.clientWidth - 10;
  }
};
</script>
