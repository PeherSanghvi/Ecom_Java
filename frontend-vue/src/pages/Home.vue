<template>
  <div class="min-h-screen font-sans" style="background-color: var(--bg-base);">
    
    <!-- Hero Section - Simplified, no purple/pink gradient -->
    <div class="relative h-[60vh] overflow-hidden flex items-center justify-center" style="background-color: var(--text-primary);">
      <div 
        class="absolute inset-0 z-0"
        :style="{ transform: `translateY(${yHero})`, opacity: opacityHero }"
      >
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000" class="w-full h-full object-cover opacity-40" alt="AURA Hero" />
        <div class="absolute inset-0" style="background: linear-gradient(to top, var(--text-primary), transparent);"></div>
      </div>

      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h1 
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 1000, delay: 200 } }"
          class="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-6"
        >
          Premium Products for Modern Living
        </h1>
        <p 
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 1000, delay: 400 } }"
          class="text-lg md:text-xl text-gray-300 mb-10 font-light max-w-2xl mx-auto"
        >
          Discover curated collections designed for quality and sustainability.
        </p>
        <div 
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 1000, delay: 600 } }"
          class="flex flex-col sm:flex-row gap-4"
        >
          <router-link to="/products" class="inline-flex items-center justify-center px-10 py-4 text-white font-bold text-sm tracking-widest uppercase rounded-full transition-transform hover:scale-105 active:scale-95" style="background-color: var(--accent-cta);">
            Shop Now <ArrowRight class="w-4 h-4 ml-2" />
          </router-link>
          <router-link to="/admin/login" class="inline-flex items-center justify-center px-10 py-4 text-gray-900 font-bold text-sm tracking-widest uppercase rounded-full transition-transform hover:scale-105 active:scale-95 bg-gray-100 hover:bg-gray-200">
            Admin Portal <ArrowRight class="w-4 h-4 ml-2" />
          </router-link>
        </div>
      </div>
    </div>

    <!-- Featured Categories -->
    <div class="py-20" style="background-color: var(--surface);">
      <div class="container-storefront">
        <div class="flex justify-between items-end mb-12">
          <h2 class="text-3xl md:text-4xl font-black tracking-tighter" style="color: var(--text-primary);">Shop by Category</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="(cat, idx) in departments" 
            :key="cat.name"
            v-motion
            :initial="{ opacity: 0, y: 40 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 700, delay: idx * 100 } }"
            :margin="'-100px'"
          >
            <router-link :to="cat.link" class="group block relative h-[300px] rounded-2xl overflow-hidden" style="background-color: var(--bg-base);">
              <img :src="cat.img" :alt="cat.name" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(26,29,35,0.8), transparent);"></div>
              <div class="absolute inset-x-0 bottom-0 p-6 flex items-center justify-between">
                <span class="text-white font-bold text-xl tracking-tight">{{ cat.name }}</span>
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style="background-color: var(--accent-primary);">
                  <ArrowRight class="w-5 h-5" />
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Trending Products -->
    <div class="py-20" style="background-color: var(--surface);">
      <div class="container-storefront">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 class="text-3xl md:text-4xl font-black tracking-tighter mb-2" style="color: var(--text-primary);">Trending Products</h2>
            <p style="color: var(--text-secondary);" class="text-base">The most coveted items in our collection.</p>
          </div>
          <router-link to="/products" class="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm group" style="color: var(--accent-primary);">
            View All <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </router-link>
        </div>

        <div class="grid-products">
          <template v-if="loading">
            <SkeletonCard v-for="i in 8" :key="i" />
          </template>
          <template v-else>
            <div 
              v-for="(product, idx) in products" 
              :key="product._id || product.id"
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visibleOnce="{ opacity: 1, y: 0, transition: { delay: idx * 100 } }"
              :margin="'-50px'"
            >
              <ProductCard :product="product" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Trust & Benefits Features -->
    <div class="py-20 border-t" style="background-color: var(--bg-base); border-color: var(--border);">
      <div class="container-storefront">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div 
            v-for="(f, i) in features" 
            :key="i"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { delay: i * 100 } }"
            class="flex flex-col gap-4"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background-color: var(--primary-light); color: var(--accent-primary);">
              <component :is="f.icon" class="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h3 class="font-bold text-lg mb-1" style="color: var(--text-primary);">{{ f.title }}</h3>
              <p style="color: var(--text-secondary);" class="text-sm leading-relaxed">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, shallowRef } from 'vue';
import api from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import SkeletonCard from '../components/SkeletonCard.vue';
import { ArrowRight, Star, ShieldCheck, Truck, Clock } from 'lucide-vue-next';

const products = ref([]);
const loading = ref(true);

const scrollY = ref(0);

const handleScroll = () => {
  scrollY.value = window.scrollY;
};

onMounted(() => {
  fetchProducts();
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Mocking useScroll() logic. The total page height for calculating scrollYProgress is approx document.body.scrollHeight - window.innerHeight.
const scrollYProgress = computed(() => {
  if (typeof document === 'undefined') return 0;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  return Math.min(Math.max(scrollY.value / maxScroll, 0), 1);
});

const yHero = computed(() => {
  return `${scrollYProgress.value * 50}%`;
});

const opacityHero = computed(() => {
  const op = 1 - (scrollYProgress.value * 2);
  return Math.max(op, 0);
});

const fetchProducts = async () => {
  try {
    const response = await api.get('/products', { params: { page: 1, limit: 8 } });
    products.value = response.data.data || response.data.products || response.data;
  } catch (error) {
    // Handled silently
  } finally {
    loading.value = false;
  }
};

const departments = [
  { name: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600', link: '/products?department=Fashion' },
  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600', link: '/products?department=Electronics' },
  { name: 'Home & Garden', img: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600', link: '/products?department=Home%20%26%20Garden' },
  { name: 'Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600', link: '/products?department=Beauty' }
];

const features = shallowRef([
  { icon: Truck, title: 'Free Global Shipping', desc: 'On all orders over $200. Fast & reliable.' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: '256-bit encryption for your peace of mind.' },
  { icon: Star, title: 'Premium Quality', desc: 'Curated products from top tier brands.' },
  { icon: Clock, title: '24/7 Support', desc: 'Our dedicated team is always here to help.' },
]);
</script>
