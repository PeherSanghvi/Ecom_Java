<template>
  <div
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }"
    class="space-y-4"
  >
    <div
      v-for="(items, section) in displaySpecs"
      :key="section"
      v-motion
      :initial="{ opacity: 0, x: -10 }"
      :enter="{ opacity: 1, x: 0, transition: { duration: 300 } }"
      class="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
    >
      <!-- Section Header -->
      <button
        @click="toggleSection(section)"
        class="w-full px-6 py-4 flex items-center justify-between font-bold text-left transition-colors hover:bg-black/5"
      >
        <span class="text-gray-900 text-base uppercase tracking-wide">{{ section }}</span>
        <div
          :style="{ transform: expandedSections[section] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
        >
          <ChevronDown class="w-5 h-5 text-gray-600" />
        </div>
      </button>

      <!-- Section Content -->
      <div
        v-if="expandedSections[section]"
        v-motion
        :initial="{ height: 0, opacity: 0 }"
        :enter="{ height: 'auto', opacity: 1, transition: { duration: 300 } }"
        :leave="{ height: 0, opacity: 0, transition: { duration: 200 } }"
        class="overflow-hidden border-t border-gray-200"
      >
        <div class="px-6 py-4 space-y-3 bg-gray-50">
          <template v-if="Array.isArray(items) && items.length > 0">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="flex items-start gap-3"
            >
              <Check class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span class="text-gray-700 text-sm leading-relaxed">
                {{ typeof item === 'object' ? JSON.stringify(item) : item }}
              </span>
            </div>
          </template>
          <template v-else>
            <div class="text-gray-500 text-sm">
              {{ typeof items === 'object' ? JSON.stringify(items) : items }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Additional Information Section -->
    <div
      v-motion
      :initial="{ opacity: 0, x: -10 }"
      :enter="{ opacity: 1, x: 0, transition: { duration: 300 } }"
      class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8"
    >
      <h3 class="font-bold text-gray-900 mb-4 text-base uppercase tracking-wide">
        Additional Information
      </h3>
      <ul class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <span class="text-blue-600 font-bold mt-1">•</span>
          <span>All products come with manufacturer warranty and customer support</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 font-bold mt-1">•</span>
          <span>Free shipping on orders over ₹500 across India</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 font-bold mt-1">•</span>
          <span>30-day easy returns and exchanges</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 font-bold mt-1">•</span>
          <span>Contact our support team for any queries</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ChevronDown, Check } from 'lucide-vue-next';

const props = defineProps({
  specifications: {
    type: [Object, Array, String],
    default: null
  },
  description: {
    type: [String, Object, Array],
    default: null
  },
  product: {
    type: Object,
    default: null
  }
});

const expandedSections = ref({});

const parsedSpecs = computed(() => {
  const specs = {};

  if (props.specifications) {
    try {
      const parsed = typeof props.specifications === 'string'
        ? JSON.parse(props.specifications.replace(/'/g, '"'))
        : props.specifications;

      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              if (!specs[key]) specs[key] = [];
              specs[key].push(value);
            });
          }
        });
      } else if (typeof parsed === 'object') {
        Object.entries(parsed).forEach(([key, value]) => {
          specs[key] = Array.isArray(value) ? value : [value];
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  if (props.description && Object.keys(specs).length === 0) {
    try {
      const parsed = typeof props.description === 'string'
        ? JSON.parse(props.description.replace(/'/g, '"'))
        : props.description;

      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              if (!specs[key]) specs[key] = [];
              specs[key].push(value);
            });
          }
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  return specs;
});

const defaultSpecs = {
  'General': [
    'Premium quality materials',
    'Modern design and finish',
    'Durable construction',
    'Eco-friendly packaging',
  ],
  'Features': [
    'High performance',
    'Easy to use',
    'Compact and portable',
    'User-friendly interface',
  ],
  'Warranty': [
    '1-year manufacturer warranty',
    '24/7 customer support',
    '30-day money-back guarantee',
    'Free technical support',
  ],
};

const displaySpecs = computed(() => {
  return Object.keys(parsedSpecs.value).length > 0 ? parsedSpecs.value : defaultSpecs;
});

const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

watch(displaySpecs, (newSpecs) => {
  const firstSection = Object.keys(newSpecs)[0];
  if (firstSection && !expandedSections.value[firstSection]) {
    expandedSections.value[firstSection] = true;
  }
}, { immediate: true });
</script>
