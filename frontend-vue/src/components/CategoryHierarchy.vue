<template>
  <div
    v-motion
    :initial="{ x: -300, opacity: 0 }"
    :enter="{ x: 0, opacity: 1, transition: { type: 'spring', damping: 25 } }"
    :leave="{ x: -300, opacity: 0 }"
    class="fixed left-0 top-0 h-screen w-80 bg-white border-r border-gray-200 overflow-y-auto z-40 lg:relative lg:fixed-none lg:h-auto lg:border-r lg:w-full"
  >
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between lg:hidden">
      <h2 class="font-bold text-lg text-black">Categories</h2>
      <button
        @click="onClose"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Categories List -->
    <div class="p-4 lg:p-6 space-y-1">
      <!-- All Products Button -->
      <button
        @click="handleAllProducts"
        :class="[
          'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all',
          isAllActive
            ? 'bg-black text-white font-bold'
            : 'text-gray-700 hover:bg-gray-100 font-semibold'
        ]"
      >
        <span>All Products</span>
      </button>

      <div v-if="loading" class="py-8 text-center">
        <div class="inline-block w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
      <p v-else-if="categories.length === 0" class="text-sm text-gray-500 py-8 text-center">No categories available</p>
      <template v-else>
        <div v-for="category in categories" :key="category.name">
          <!-- Primary Category -->
          <button
            @click="handleCategoryClick(category.name)"
            :class="[
              'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all mt-1',
              isCategoryActive(category.name)
                ? 'bg-black text-white font-bold'
                : 'text-gray-700 hover:bg-gray-100 font-semibold'
            ]"
          >
            <span class="flex items-center gap-2 flex-1 text-left">
              <span>{{ category.name }}</span>
              <span class="text-xs opacity-70">({{ category.productCount }})</span>
            </span>
            <button
              v-if="category.subcategories && category.subcategories.length > 0"
              @click.stop="toggleCategory(category.name)"
              :class="[
                'p-1 rounded transition-transform',
                isCategoryActive(category.name) ? 'text-white' : 'text-gray-400'
              ]"
            >
              <div
                :style="{ transform: expandedCategory === category.name ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
              >
                <ChevronDown class="w-4 h-4" />
              </div>
            </button>
          </button>

          <!-- Subcategories -->
          <div
            v-if="expandedCategory === category.name && category.subcategories"
            v-motion
            :initial="{ height: 0, opacity: 0 }"
            :enter="{ height: 'auto', opacity: 1, transition: { duration: 200 } }"
            :leave="{ height: 0, opacity: 0, transition: { duration: 200 } }"
            class="overflow-hidden"
          >
            <div class="pl-4 space-y-1 mt-1">
              <button
                v-for="subCat in category.subcategories"
                :key="subCat"
                @click="handleSubcategoryClick(category.name, subCat)"
                :class="[
                  'w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
                  isSubcategoryActive(subCat)
                    ? 'bg-black text-white font-bold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                ]"
              >
                <ChevronRight class="w-3 h-3" />
                <span>{{ subCat }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Clear Filters Button -->
    <div
      v-if="currentDepartment || currentSubcategory"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0 }"
      class="border-t border-gray-200 p-4 lg:p-6"
    >
      <button
        @click="handleAllProducts"
        class="w-full py-2 px-4 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
      >
        Clear All Filters
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ChevronRight, ChevronDown, X } from 'lucide-vue-next';
import api from '../services/api';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
});
const emit = defineEmits(['close']);
const onClose = () => emit('close');

const router = useRouter();
const route = useRoute();

const categories = ref([]);
const loading = ref(true);
const expandedCategory = ref(null);

const currentDepartment = computed(() => route.query.department || '');
const currentSubcategory = computed(() => route.query.subcategory || '');

const fetchCategories = async () => {
  try {
    const response = await api.get('/products/categories/hierarchy');
    if (response.data?.success) {
      categories.value = response.data.data || [];
      
      if (currentDepartment.value) {
        expandedCategory.value = currentDepartment.value;
      }
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});

watch(currentDepartment, (newVal) => {
  if (newVal) {
    expandedCategory.value = newVal;
  }
});

const handleAllProducts = () => {
  router.push({ path: route.path, query: { page: '1' } });
  expandedCategory.value = null;
};

const handleCategoryClick = (departmentName) => {
  const query = { ...route.query, department: departmentName, page: '1' };
  delete query.subcategory;
  router.push({ path: route.path, query });
  expandedCategory.value = departmentName;
};

const handleSubcategoryClick = (departmentName, subcatName) => {
  router.push({ 
    path: route.path, 
    query: { ...route.query, department: departmentName, subcategory: subcatName, page: '1' } 
  });
};

const toggleCategory = (categoryName) => {
  expandedCategory.value = expandedCategory.value === categoryName ? null : categoryName;
};

const isSubcategoryActive = (subCat) => {
  return currentSubcategory.value === subCat;
};

const isCategoryActive = (catName) => {
  return currentDepartment.value === catName;
};

const isAllActive = computed(() => !currentDepartment.value && !currentSubcategory.value);
</script>
