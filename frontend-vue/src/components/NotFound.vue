<template>
  <div
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { duration: 500 } }"
    class="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-20"
  >
    <div class="text-center max-w-md mx-auto">
      <!-- Animated 404 -->
      <div
        v-motion
        :initial="{ scale: 0.8, opacity: 0 }"
        :enter="{ scale: 1, opacity: 1, transition: { delay: 100, duration: 500 } }"
        class="mb-8"
      >
        <div class="text-8xl sm:text-9xl font-black text-black tracking-tighter mb-4">
          404
        </div>
        <div class="w-24 h-1 bg-gradient-to-r from-transparent via-black to-transparent mx-auto mb-8"></div>
      </div>

      <!-- Title and Message -->
      <div
        v-motion
        :initial="{ y: 20, opacity: 0 }"
        :enter="{ y: 0, opacity: 1, transition: { delay: 200, duration: 500 } }"
        class="mb-8"
      >
        <h1 class="text-2xl sm:text-3xl font-bold text-black mb-4 tracking-tight">
          {{ title }}
        </h1>
        <p class="text-gray-600 text-base leading-relaxed">
          {{ message }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div
        v-motion
        :initial="{ y: 20, opacity: 0 }"
        :enter="{ y: 0, opacity: 1, transition: { delay: 300, duration: 500 } }"
        class="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button
          v-motion
          :hovered="{ scale: 1.05 }"
          :tapped="{ scale: 0.95 }"
          @click="router.back()"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider border border-black text-black hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          Go Back
        </button>

        <button
          v-motion
          :hovered="{ scale: 1.05 }"
          :tapped="{ scale: 0.95 }"
          @click="router.push('/')"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider bg-black text-white hover:bg-gray-900 transition-colors"
        >
          <Home class="w-4 h-4" />
          Go Home
        </button>

        <button
          v-motion
          :hovered="{ scale: 1.05 }"
          :tapped="{ scale: 0.95 }"
          @click="router.push('/products')"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider bg-gray-200 text-black hover:bg-gray-300 transition-colors"
        >
          <Search class="w-4 h-4" />
          Browse Products
        </button>
      </div>

      <!-- Decorative Elements -->
      <div class="mt-16 animate-bounce">
        <div class="text-6xl opacity-20">🔍</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ArrowLeft, Home, Search } from 'lucide-vue-next';

defineProps({
  title: {
    type: String,
    default: '404 - Page Not Found'
  },
  message: {
    type: String,
    default: 'The page you are looking for does not exist.'
  }
});

const router = useRouter();
</script>
