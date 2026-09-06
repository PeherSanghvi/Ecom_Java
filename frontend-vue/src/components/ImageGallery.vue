<template>
  <div
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { duration: 500 } }"
    class="flex flex-col gap-4"
  >
    <!-- Main Image Container -->
    <div
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
      class="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 group"
      @mousemove="handleMouseMove"
      @mouseleave="isZoomed = false"
      ref="mainImageRef"
    >
      <!-- Main Image -->
      <img
        :key="selectedImage"
        :src="selectedImage"
        :alt="`${title} - Image ${selectedImageIndex + 1}`"
        class="w-full h-full object-contain cursor-zoom-in transition-transform duration-300 ease-out"
        :style="{
          transform: isZoomed ? 'scale(2)' : 'scale(1)',
          transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
        }"
        @click="isZoomed = !isZoomed"
      />

      <!-- Zoom Indicator -->
      <div
        v-if="!isZoomed"
        @click="isZoomed = true"
        class="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md cursor-pointer hover:scale-110 transition-transform"
      >
        <ZoomIn class="w-5 h-5 text-black" />
      </div>

      <!-- Navigation Arrows -->
      <template v-if="validImages.length > 1">
        <!-- Left Arrow -->
        <button
          @click.stop="goToPrevious"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
          aria-label="Previous image"
        >
          <ChevronLeft class="w-5 h-5 text-black" />
        </button>

        <!-- Right Arrow -->
        <button
          @click.stop="goToNext"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
          aria-label="Next image"
        >
          <ChevronRight class="w-5 h-5 text-black" />
        </button>
      </template>

      <!-- Image Counter -->
      <div
        v-if="validImages.length > 1"
        class="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold"
      >
        {{ selectedImageIndex + 1 }} / {{ validImages.length }}
      </div>
    </div>

    <!-- Thumbnail Gallery -->
    <div
      v-if="validImages.length > 1"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }"
      class="flex gap-2 overflow-x-auto pb-2"
    >
      <button
        v-for="(image, index) in validImages"
        :key="index"
        @click="handleThumbnailClick(index)"
        :class="[
          'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 active:scale-95',
          selectedImageIndex === index ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-400'
        ]"
      >
        <img
          :src="image"
          :alt="`Thumbnail ${index + 1}`"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </button>
    </div>

    <!-- Info Text -->
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { duration: 400, delay: 200 } }"
      class="text-xs text-gray-500 font-medium"
    >
      {{ isZoomed ? 'Click to zoom out · Use arrow keys to navigate' : 'Click image to zoom · Use arrow keys to navigate' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-vue-next';

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Product Image'
  }
});

const selectedImageIndex = ref(0);
const isZoomed = ref(false);
const zoomPosition = ref({ x: 0, y: 0 });
const mainImageRef = ref(null);

// Reset to first image whenever a new product's images are passed in
watch(() => props.images, () => {
  selectedImageIndex.value = 0;
  isZoomed.value = false;
}, { deep: true });

const validImages = computed(() => {
  return props.images.filter(img => img && typeof img === 'string').length > 0 
    ? props.images.filter(img => img && typeof img === 'string')
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80'];
});

const selectedImage = computed(() => validImages.value[selectedImageIndex.value]);

const handleMouseMove = (e) => {
  if (!isZoomed.value || !mainImageRef.value) return;
  const rect = mainImageRef.value.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  zoomPosition.value = { x, y };
};

const goToNext = () => {
  selectedImageIndex.value = (selectedImageIndex.value + 1) % validImages.value.length;
};

const goToPrevious = () => {
  selectedImageIndex.value = (selectedImageIndex.value - 1 + validImages.value.length) % validImages.value.length;
};

const handleThumbnailClick = (index) => {
  selectedImageIndex.value = index;
  isZoomed.value = false;
};

const handleKeyPress = (e) => {
  if (e.key === 'ArrowLeft') goToPrevious();
  if (e.key === 'ArrowRight') goToNext();
  if (e.key === 'Escape') isZoomed.value = false;
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});
</script>
