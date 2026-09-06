<template>
  <div class="bg-white min-h-screen pb-24 pt-10 font-sans">
    <div class="flex gap-0">
      <!-- Sidebar - Desktop only -->
      <div class="hidden lg:block lg:w-80 border-r border-gray-200 sticky top-20 h-fit max-h-[calc(100vh-80px)] overflow-y-auto">
        <CategoryHierarchy :isOpen="true" />
      </div>

      <!-- Main Content -->
      <div class="flex-1">
        <div class="container-minimal">
          <!-- Header & Page Title -->
          <div class="flex flex-col mb-12">
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tighter capitalize mb-4 break-words">
              {{ keyword ? `Search: "${keyword}"` : subcategory ? subcategory : department ? department : 'Collection' }}
            </h1>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
              <p class="text-gray-400 font-medium">Showing {{ filteredProducts.length }} premium items</p>
              
              <div class="flex items-center gap-4">
                <button @click="showMobileFilters = true" class="lg:hidden flex items-center gap-2 bg-gray-50 border border-gray-200 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm uppercase tracking-wider">
                  <SlidersHorizontal class="w-4 h-4" /> Filters
                </button>
                <div class="relative group hidden md:block">
                  <select 
                    v-model="sortOption"
                    class="bg-gray-50 border border-gray-100 rounded-full py-2.5 pl-6 pr-12 text-sm font-bold text-gray-900 appearance-none outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-sm uppercase tracking-wider"
                  >
                    <option>Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest Arrivals</option>
                  </select>
                  <ChevronDown class="w-4 h-4 text-gray-500 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div
            v-if="error"
            v-motion
            :initial="{ opacity: 0, y: -10 }"
            :enter="{ opacity: 1, y: 0 }"
            class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          >
            {{ error }}
          </div>

          <!-- Products Grid -->
          <template v-if="loading">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SkeletonCard v-for="i in 12" :key="i" />
            </div>
          </template>
          <template v-else-if="filteredProducts.length > 0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              <div
                v-for="product in filteredProducts"
                :key="product._id"
                v-motion
                :initial="{ opacity: 0 }"
                :enter="{ opacity: 1, transition: { duration: 300 } }"
              >
                <ProductCard :product="product" />
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0 }"
              class="flex items-center justify-center gap-2 flex-wrap"
            >
              <button
                @click="handlePageChange(page - 1)"
                :disabled="page === 1"
                class="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                &larr; Previous
              </button>

              <template v-for="(_, i) in Math.min(5, totalPages)" :key="i">
                <button
                  v-if="Math.max(1, page - 2) + i <= totalPages"
                  @click="handlePageChange(Math.max(1, page - 2) + i)"
                  :class="[
                    'px-3 py-2 rounded-lg font-bold text-sm transition-all',
                    page === (Math.max(1, page - 2) + i)
                      ? 'bg-black text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  {{ Math.max(1, page - 2) + i }}
                </button>
              </template>

              <button
                @click="handlePageChange(page + 1)"
                :disabled="page === totalPages"
                class="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          </template>
          <template v-else>
            <div
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0 }"
              class="text-center py-20"
            >
              <p class="text-2xl font-bold text-gray-900 mb-2">No products found</p>
              <p class="text-gray-500">Try adjusting your filters or search criteria</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Mobile Sidebar -->
      <template v-if="showMobileFilters">
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1 }"
          :leave="{ opacity: 0 }"
          @click="showMobileFilters = false"
          class="fixed inset-0 bg-black/50 z-30 lg:hidden"
        ></div>
        <CategoryHierarchy :isOpen="showMobileFilters" @close="showMobileFilters = false" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import CategoryHierarchy from '../components/CategoryHierarchy.vue';
import SkeletonCard from '../components/SkeletonCard.vue';
import { SlidersHorizontal, ChevronDown } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const totalPages = ref(0);
const showMobileFilters = ref(false);

const page = computed(() => parseInt(route.query.page || '1', 10));
const limit = computed(() => parseInt(route.query.limit || '12', 10));
const keyword = computed(() => route.query.q || '');
const department = computed(() => route.query.department || '');
const subcategory = computed(() => route.query.subcategory || '');
const category = computed(() => route.query.category || '');

const priceRange = ref(500000);
const selectedBrands = ref([]);
const sortOption = ref('Featured');

const fetchProducts = async () => {
  loading.value = true;
  try {
    const params = { page: page.value, limit: limit.value };
    if (keyword.value) params.keyword = keyword.value;
    if (department.value) params.department = department.value;
    if (subcategory.value) params.subcategory = subcategory.value;

    const response = await api.get('/products', { params });
    products.value = response.data.data || [];
    totalPages.value = response.data.pagination?.totalPages || 0;
    error.value = null;
  } catch (err) {
    error.value = 'Failed to load collection. Please try again.';
  } finally {
    loading.value = false;
  }
};

watch(() => route.query, () => {
  fetchProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, { deep: true });

onMounted(() => {
  fetchProducts();
});

const handlePageChange = (newPage) => {
  const query = { ...route.query, page: newPage.toString() };
  router.push({ query });
};

const filteredProducts = computed(() => {
  let filtered = products.value.filter(p => {
    const price = p.price_minor ?? p.effectivePriceCents ?? p.price ?? 0;
    return price <= 500000;
  });

  if (sortOption.value === 'Price: Low to High') {
    filtered.sort((a, b) => {
      const pA = a.price_minor ?? a.effectivePriceCents ?? a.priceCents ?? 0;
      const pB = b.price_minor ?? b.effectivePriceCents ?? b.priceCents ?? 0;
      return pA - pB;
    });
  } else if (sortOption.value === 'Price: High to Low') {
    filtered.sort((a, b) => {
      const pA = a.price_minor ?? a.effectivePriceCents ?? a.priceCents ?? 0;
      const pB = b.price_minor ?? b.effectivePriceCents ?? b.priceCents ?? 0;
      return pB - pA;
    });
  }

  return filtered;
});
</script>
