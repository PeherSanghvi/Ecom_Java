<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Search Products
      </h1>
      <p class="text-gray-600">Find exactly what you're looking for</p>
    </div>

    <!-- Search Form -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
      <form @submit.prevent="handleSearch" class="relative">
        <div class="mb-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              v-model="query"
              @focus="showHistory = true"
              @input="showHistory = false"
              placeholder="Search for products..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pl-10 pr-12"
            />
          </div>
        </div>
        
        <button
          type="submit"
          class="absolute right-3 top-8 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          Search
        </button>
      </form>

      <div v-if="showHistory && searchHistory.length > 0 && !query" class="mt-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-700">Recent Searches</h3>
          <button
            @click="clearHistory"
            class="text-sm text-red-600 hover:text-red-800"
          >
            Clear All
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(historyQuery, index) in searchHistory"
            :key="index"
            @click="handleHistoryClick(historyQuery)"
            class="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {{ historyQuery }}
          </button>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCard v-for="i in 8" :key="i" />
      </div>
    </template>
    <template v-else-if="results.length > 0">
      <p class="text-gray-600 mb-6">
        Found {{ results.length }} {{ results.length === 1 ? 'result' : 'results' }} for "{{ query }}"
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard v-for="product in results" :key="product.id || product._id" :product="product" />
      </div>
    </template>
    <template v-else-if="query">
      <div class="text-center py-16 bg-white rounded-2xl shadow-sm">
        <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
        <p class="text-gray-500 mb-4">Try different keywords or browse our categories</p>
        <router-link
          to="/products"
          class="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          Browse All Products
        </router-link>
      </div>
    </template>
    <template v-else>
      <div class="text-center py-16 bg-white rounded-2xl shadow-sm">
        <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Start Searching</h3>
        <p class="text-gray-500">Enter a keyword above to find products</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import SkeletonCard from '../components/SkeletonCard.vue';

const route = useRoute();
const router = useRouter();

const query = ref(route.query.q || '');
const results = ref([]);
const loading = ref(false);
const searchHistory = ref([]);
const showHistory = ref(false);

onMounted(() => {
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  searchHistory.value = history;
});

let debounceTimeout = null;

const fetchResults = async (searchQuery) => {
  if (!searchQuery.trim()) {
    results.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const response = await api.get('/products', { params: { page: 1, limit: 20, search: searchQuery } });
    results.value = response.data.data || response.data.products || [];
  } catch (error) {
    results.value = [];
  } finally {
    loading.value = false;
  }
};

watch(query, (newVal) => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  if (newVal.trim()) {
    debounceTimeout = setTimeout(() => {
      fetchResults(newVal);
    }, 300);
  } else {
    results.value = [];
  }
});

onMounted(() => {
  if (query.value.trim()) {
    fetchResults(query.value);
  }
});

watch(() => route.query.q, (newQ) => {
  if (newQ !== undefined && newQ !== query.value) {
    query.value = newQ;
    showHistory.value = false;
  }
});

const handleSearch = () => {
  if (!query.value.trim()) return;

  const newHistory = [query.value, ...searchHistory.value.filter(h => h !== query.value)].slice(0, 10);
  localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  searchHistory.value = newHistory;

  router.replace({ query: { ...route.query, q: query.value } });
  showHistory.value = false;
};

const handleHistoryClick = (historyQuery) => {
  query.value = historyQuery;
  router.replace({ query: { ...route.query, q: historyQuery } });
  showHistory.value = false;
};

const clearHistory = () => {
  localStorage.removeItem('searchHistory');
  searchHistory.value = [];
};
</script>
