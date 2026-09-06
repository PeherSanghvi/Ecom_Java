<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-24 flex items-center justify-center">
    <div class="w-full max-w-md px-6">
      <div v-motion-slide-visible-bottom :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">
        <div class="text-center mb-10">
          <div class="flex items-center justify-center gap-3 mb-4">
            <Shield class="w-8 h-8 text-amber-500" />
            <h1 class="text-3xl font-bold tracking-tight text-white">Admin Portal</h1>
          </div>
          <p class="text-gray-400">Sign in to access the admin dashboard</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {{ error }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                v-model="email"
                required
                placeholder="admin@example.com"
                class="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                v-model="password"
                required
                placeholder="••••••••"
                class="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <template v-if="loading">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Verifying...
            </template>
            <template v-else>
              Access Dashboard <ArrowRight class="w-4 h-4" />
            </template>
          </button>
        </form>

        <div class="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p class="text-blue-400 text-sm">
            <strong>Demo Admin:</strong> Use your registered admin email to log in
          </p>
        </div>

        <div class="mt-8 text-center">
          <p class="text-gray-400">
            Regular user?
            <router-link to="/login" class="font-medium text-amber-500 hover:text-amber-400 transition-colors">
              Sign in here
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../stores/admin';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-vue-next';
import { toast } from 'vue3-toastify';

const adminStore = useAdminStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    const result = await adminStore.login(email.value, password.value);
    
    if (result.success) {
      toast.success('Admin logged in successfully');
      router.replace('/admin/dashboard');
    } else {
      error.value = result.error || 'Admin login failed. Please try again.';
    }
  } catch (err) {
    console.error('Admin login error:', err);
    error.value = err.response?.data?.message || err.message || 'Invalid email or credentials';
  } finally {
    loading.value = false;
  }
};
</script>
