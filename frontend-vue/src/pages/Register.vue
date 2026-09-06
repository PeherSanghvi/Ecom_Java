<template>
  <div class="min-h-screen bg-white pt-24 pb-24 flex items-center justify-center">
    <div class="w-full max-w-md px-6">
      <div v-motion-slide-visible-bottom :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold tracking-tight mb-3">Create account</h1>
          <p class="text-gray-600">Join AURA and start your shopping journey</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">First Name</label>
            <div class="relative">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                v-model="firstName"
                required
                placeholder="John"
                class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Last Name</label>
            <div class="relative">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                v-model="lastName"
                required
                placeholder="Doe"
                class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>
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

          <div>
            <label class="block text-sm font-medium mb-2">Confirm Password</label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="confirmPassword"
                required
                placeholder="••••••••"
                class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div class="pt-4 border-t border-gray-200">
            <h3 class="text-md font-semibold mb-4">Address Information</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Street</label>
                <input type="text" v-model="address.street" required placeholder="Street Address" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">City</label>
                  <input type="text" v-model="address.city" required placeholder="City" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">State</label>
                  <input type="text" v-model="address.state" required placeholder="State" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Pincode</label>
                <input type="text" v-model="address.pincode" required placeholder="Pincode" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" />
              </div>
            </div>
          </div>

          <div class="flex items-start gap-2">
            <input type="checkbox" required class="w-4 h-4 mt-1 rounded border-gray-300" />
            <span class="text-sm text-gray-600">
              I agree to the <router-link to="#" class="text-black hover:underline">Terms of Service</router-link> and <router-link to="#" class="text-black hover:underline">Privacy Policy</router-link>
            </span>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <template v-if="loading">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating account...
            </template>
            <template v-else>
              Create Account <ArrowRight class="w-4 h-4" />
            </template>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-600">
            Already have an account?
            <router-link to="/login" class="font-medium text-black hover:underline">
              Sign in
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
import { useAuthStore } from '../stores/auth';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-vue-next';
import { toast } from 'vue3-toastify';

const authStore = useAuthStore();
const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
const address = ref({
  street: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India'
});

const handleSubmit = async () => {
  error.value = '';
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }

  loading.value = true;

  try {
    const result = await authStore.register(firstName.value, lastName.value, email.value, password.value, '', address.value);
    
    if (result.success) {
      toast.success('Account created successfully');
      router.replace('/');
    } else {
      error.value = result.error || 'Registration failed. Please try again.';
    }
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
