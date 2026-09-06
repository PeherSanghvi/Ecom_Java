<template>
  <div v-if="loading" class="flex items-center justify-center min-h-[70vh] bg-gray-50 font-sans">
    <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
  </div>
  
  <div v-else-if="!order" class="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 font-sans">
    <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
      <Search class="w-10 h-10" />
    </div>
    <h2 class="text-3xl font-black text-gray-900 mb-2 tracking-tighter">{{ error || 'Order not found' }}</h2>
    <router-link to="/admin" class="text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors mt-4">Return to Dashboard</router-link>
  </div>

  <div v-else class="min-h-screen py-10 font-sans" style="background-color: var(--bg-admin)">
    <div class="container-admin max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="mb-8">
        <router-link to="/admin/orders" class="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-colors" style="color: var(--text-secondary)">
          <ArrowLeft class="w-4 h-4" />
          Back to Dashboard
        </router-link>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0 }"
        class="rounded-xl shadow-sm overflow-hidden"
        style="background-color: var(--surface); border: 1px solid var(--border)"
      >
        
        <!-- Header -->
        <div class="p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style="border-color: var(--border)">
          <div>
            <div class="flex items-center gap-4 mb-2">
              <h1 class="text-3xl font-black tracking-tighter" style="color: var(--text-primary)">Order #{{ order.id || order._id }}</h1>
              <span :class="[
                'badge',
                `badge-${order.status.toLowerCase()}`
              ]">
                {{ order.status }}
              </span>
            </div>
            <p class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--text-secondary)">
              {{ formatDateTime(order.order_date || order.createdAt || order.orderDate) }}
            </p>
          </div>
          <div class="flex flex-col items-end">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full" style="background-color: var(--bg-base)">
              <div :class="['w-2 h-2 rounded-full', { 'animate-pulse': syncStatus === 'Out of Sync' }]" :style="{ backgroundColor: syncDotColor }"></div>
              <span class="text-xs font-bold" style="color: var(--text-primary)">{{ syncStatus }}</span>
            </div>
            <span class="text-[10px] font-bold mt-3 tracking-widest uppercase flex items-center gap-1" style="color: var(--text-secondary)">
              <Server class="w-3 h-3" /> v{{ order.version }}
            </span>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="mx-8 mt-6 p-4 rounded-xl text-xs font-bold flex items-center gap-3" style="background-color: var(--danger-light); border-color: var(--danger); border: 1px solid; color: var(--danger)">
          <AlertCircle class="w-5 h-5 shrink-0" />
          {{ error }}
        </div>

        <div class="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left: Items -->
          <div class="lg:col-span-2 space-y-8">
            <div>
              <h2 class="text-xl font-black mb-6 tracking-tighter flex items-center gap-3" style="color: var(--text-primary)">
                <FileText class="w-5 h-5" :style="{ color: 'var(--text-secondary)' }" />
                Itemized Receipt
              </h2>
              
              <div class="rounded-xl overflow-hidden shadow-sm border" style="border-color: var(--border)">
                <table class="w-full text-left text-sm">
                  <thead class="uppercase tracking-widest text-[10px] font-bold" style="background-color: var(--bg-base); color: var(--text-secondary)">
                    <tr>
                      <th class="p-4 border-b" style="border-color: var(--border)">Details</th>
                      <th class="p-4 text-center border-b" style="border-color: var(--border)">Qty</th>
                      <th class="p-4 text-right border-b" style="border-color: var(--border)">Price</th>
                      <th class="p-4 text-right border-b" style="border-color: var(--border)">Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y" style="border-color: var(--border)">
                    <tr v-for="(item, idx) in order.items" :key="idx" class="hover:bg-gray-50 transition-colors">
                      <td class="p-4">
                        <p class="font-bold" style="color: var(--text-primary)">{{ item.title }}</p>
                        <p class="text-[10px] font-bold mt-1 uppercase tracking-widest" style="color: var(--text-secondary)">{{ item.sku }}</p>
                      </td>
                      <td class="p-4 text-center font-black" style="color: var(--text-primary)">{{ item.quantity }}</td>
                      <td class="p-4 text-right font-black text-tabular" style="color: var(--text-secondary)">{{ formatINR(item.unit_price_minor || item.unitPriceCents || 0) }}</td>
                      <td class="p-4 text-right font-black text-tabular" style="color: var(--text-primary)">{{ formatINR(item.line_total_minor || (item.unit_price_minor * item.quantity) || 0) }}</td>
                    </tr>
                  </tbody>
                </table>
                <div class="p-6 border-t flex justify-end" style="background-color: var(--bg-base); border-color: var(--border)">
                  <div class="text-right">
                    <p class="text-[10px] font-bold mb-2 uppercase tracking-widest" style="color: var(--text-secondary)">Order Total</p>
                    <p class="text-4xl font-black tracking-tight text-tabular" style="color: var(--text-primary)">{{ formatINR(order.total_minor || order.totalCents || order.totalMinor || 0) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Info & Actions -->
          <div class="space-y-6">
            
            <!-- Customer Profile -->
            <div class="rounded-xl p-6 shadow-sm border" style="background-color: var(--surface); border-color: var(--border)">
              <h2 class="text-[10px] font-bold mb-6 uppercase tracking-widest flex items-center gap-3" style="color: var(--text-secondary)">
                <User class="w-4 h-4" :style="{ color: 'var(--text-secondary)' }" />
                Customer Profile
              </h2>
              <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shrink-0" style="background-color: var(--accent-primary)">
                  {{ (order.customer?.name || order.customer?.firstName || 'U').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-black text-lg tracking-tight" style="color: var(--text-primary)">{{ order.customer?.name || order.customer?.firstName }}</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest mt-1" style="color: var(--text-secondary)">{{ order.customer?.email }}</p>
                </div>
              </div>
              <div class="pt-4 border-t" style="border-color: var(--border)">
                <p class="text-[10px] font-bold uppercase tracking-widest mb-1" style="color: var(--text-secondary)">Customer ID</p>
                <p class="text-xs font-bold" style="color: var(--text-primary)">{{ order.customer?.id }}</p>
              </div>
            </div>

            <!-- Status Management -->
            <div class="rounded-xl p-6 shadow-sm border" style="background-color: var(--bg-base); border-color: var(--border)">
              <h2 class="text-[10px] font-bold mb-6 uppercase tracking-widest flex items-center gap-3" style="color: var(--text-primary)">
                <RefreshCw class="w-4 h-4" :style="{ color: 'var(--text-primary)' }" />
                Manage Status
              </h2>
              <div class="relative">
                <select 
                  v-model="selectedStatus" 
                  class="w-full rounded-lg p-4 text-sm font-bold outline-none transition-all shadow-sm appearance-none cursor-pointer mb-4"
                  style="background-color: var(--surface); border: 1px solid var(--border); color: var(--text-primary)"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button 
                  @click="handleStatusUpdate"
                  :disabled="updating || selectedStatus === order.status"
                  class="w-full py-3 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-3 shadow-lg disabled:shadow-none"
                  :style="{
                    backgroundColor: selectedStatus === order.status || updating ? 'var(--text-3)' : 'var(--accent-primary)',
                    color: selectedStatus === order.status || updating ? 'var(--text-secondary)' : 'white'
                  }"
                >
                  <div v-if="updating" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <CheckCircle2 v-else class="w-4 h-4" />
                  {{ updating ? 'Updating...' : 'Save Status' }}
                </button>
                <p v-if="selectedStatus === order.status" class="text-[10px] text-center font-bold mt-4 uppercase tracking-widest" style="color: var(--text-secondary)">No changes to save</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, User, Server, AlertCircle, RefreshCw, FileText, CheckCircle2, Search } from 'lucide-vue-next';
import { formatINR } from '../utils/currency';
import { useAdminStore } from '../stores/admin';
import api from '../services/api';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const order = ref(null);
const loading = ref(true);
const error = ref('');
const updating = ref(false);
const selectedStatus = ref('');

const syncStatus = computed(() => {
  if (!order.value) return 'Synced';
  return order.value.syncedToSearch && order.value.sourceVersion === order.value.version ? 'Synced' : 
         order.value.syncedToSearch ? 'Out of Sync' : 'Synced';
});

const syncDotColor = computed(() => {
  if (syncStatus.value === 'Synced') return 'var(--success)';
  if (syncStatus.value === 'Out of Sync') return 'var(--danger)';
  return 'var(--status-pending)';
});

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const fetchOrder = async () => {
  try {
    const response = await api.get(`/orders/${route.params.id}`);
    order.value = response.data.order || response.data;
    selectedStatus.value = response.data.order?.status || response.data.status;
    error.value = '';
  } catch (err) {
    console.error('Failed to fetch order:', err);
    error.value = 'Failed to fetch order details.';
  } finally {
    loading.value = false;
  }
};

const handleStatusUpdate = async () => {
  if (selectedStatus.value === order.value.status) return;
  
  updating.value = true;
  try {
    const response = await api.patch(`/orders/${route.params.id}/status`, { 
      status: selectedStatus.value, 
      version: order.value.version 
    });
    order.value = response.data.order || response.data;
    error.value = '';
    toast.success('Order status updated successfully');
  } catch (err) {
    console.error('Failed to update status:', err);
    if (err.response?.status === 409) {
      error.value = 'Conflict: Order modified by another process. Please refresh.';
      fetchOrder();
    } else {
      error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update status.';
    }
  } finally {
    updating.value = false;
  }
};

onMounted(async () => {
  // Ensure admin token is restored from localStorage before any authenticated call
  if (!adminStore.isInitialized) {
    await adminStore.initializeAdmin();
  }
  fetchOrder();
});
</script>

<style scoped>
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.badge-pending {
  background-color: #fef08a;
  color: #854d0e;
}

.badge-processing {
  background-color: #fecaca;
  color: #7f1d1d;
}

.badge-shipped {
  background-color: #bfdbfe;
  color: #1e40af;
}

.badge-delivered {
  background-color: #bbf7d0;
  color: #065f46;
}

.badge-cancelled {
  background-color: #fecaca;
  color: #7f1d1d;
}
</style>
