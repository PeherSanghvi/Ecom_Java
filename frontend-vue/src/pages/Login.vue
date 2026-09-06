<template>
  <div class="min-h-screen bg-white pt-24 pb-24 flex items-center justify-center">
    <div class="w-full max-w-md px-6">
      <div v-motion-slide-visible-bottom :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold tracking-tight mb-3">Welcome back</h1>
          <p class="text-gray-600">Sign in to your account to continue</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                v-model="email"
                required
                placeholder="you@example.com"
                class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Password</label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                required
                placeholder="••••••••"
                class="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <EyeOff v-if="showPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 rounded border-gray-300" />
              <span class="text-sm text-gray-600">Remember me</span>
            </label>
            <router-link to="#" class="text-sm text-gray-600 hover:text-black transition-colors">
              Forgot password?
            </router-link>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <template v-if="loading">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Signing in...
            </template>
            <template v-else>
              Sign In <ArrowRight class="w-4 h-4" />
            </template>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <router-link to="/register" class="font-medium text-black hover:underline">
              Sign up
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-vue-next';
import { toast } from 'vue3-toastify';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const from = route.query.from || '/';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    const result = await authStore.login(email.value, password.value);
    
    if (result.success) {
      toast.success('Successfully logged in');
      router.replace(from);
    } else {
      error.value = result.error || 'Login failed. Please try again.';
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.response?.data?.message || err.message || 'Invalid email or password';
  } finally {
    loading.value = false;
  }
};
</script>
