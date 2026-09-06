<template>
  <div class="min-h-screen bg-gray-50 flex font-sans">
    <!-- Sidebar Overlay (Mobile) -->
    <Transition>
      <div 
        v-if="!sidebarOpen"
        class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
        @click="sidebarOpen = true"
      />
    </Transition>

    <!-- Sidebar -->
    <aside 
      :style="{ width: sidebarOpen ? '280px' : '0px' }"
      class="fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 lg:static lg:block overflow-hidden flex flex-col shrink-0 transition-all duration-300"
    >
      <div class="h-20 flex items-center px-8 border-b border-gray-100 shrink-0">
        <router-link to="/admin/dashboard" class="flex items-center gap-3">
          <Hexagon class="w-8 h-8 text-black fill-black" />
          <span class="text-xl font-black text-black tracking-tighter">
            AURA<span class="text-gray-400 font-light ml-1">Admin</span>
          </span>
        </router-link>
      </div>

      <div class="flex-1 overflow-y-auto py-8 px-6">
        <p class="px-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Management</p>
        <nav class="space-y-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              'flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all',
              isActive(item.href, item.activeMatch)
                ? 'bg-black text-white shadow-lg'
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            ]"
          >
            <span :class="[
              isActive(item.href, item.activeMatch) ? 'text-white' : 'text-gray-400'
            ]">
              <component :is="item.icon" class="w-5 h-5" />
            </span>
            {{ item.name }}
          </router-link>
        </nav>
      </div>

      <div class="p-6 border-t border-gray-100">
        <div class="flex items-center gap-4 px-2 mb-6">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black font-black border border-gray-200">
            {{ (adminStore.admin?.firstName || adminStore.admin?.name || 'A').charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-black text-black truncate">{{ adminStore.admin?.firstName || adminStore.admin?.name || 'Administrator' }}</p>
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">{{ adminStore.admin?.email || 'admin@aura.com' }}</p>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200"
        >
          <LogOut class="w-4 h-4" /> Sign out
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Admin Header -->
      <header class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sm:px-10 shrink-0 z-10 sticky top-0">
        <div class="flex items-center gap-6">
          <button 
            @click="sidebarOpen = !sidebarOpen"
            class="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Menu class="w-6 h-6" />
          </button>
          <h2 class="text-xl font-black text-black tracking-tighter hidden sm:block">Dashboard Overview</h2>
        </div>
        
        <div class="flex items-center gap-4">
          <button class="p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-colors relative">
            <span class="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            <Bell class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50/50 p-6 sm:p-10">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '../stores/admin';
import { LayoutDashboard, ShoppingBag, Store, LogOut, Menu, Bell, Hexagon } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();
const sidebarOpen = ref(true);

const navigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard, activeMatch: '/admin/dashboard' },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, activeMatch: '/admin/orders' },
  { name: 'Storefront', href: '/products', icon: Store },
];

const isActive = (href, match) => {
  if (match && route.path.startsWith(match)) return true;
  return false;
};

const handleLogout = () => {
  adminStore.logout();
  router.push('/admin/login');
};
</script>

<style scoped>
.transition-all {
  transition: all 300ms ease;
}
</style>
