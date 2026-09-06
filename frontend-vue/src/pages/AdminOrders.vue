<template>
  <div class="font-sans" style="background-color: var(--bg-admin)">
    <div class="flex flex-col xl:flex-row gap-8">
      
      <!-- Sidebar Filters -->
      <aside class="w-full xl:w-72 shrink-0">
        <div class="p-6 rounded-xl shadow-sm sticky top-24" style="background-color: var(--sidebar-bg)">
          <h2 class="text-lg font-black mb-6 flex items-center gap-3 tracking-tighter" style="color: var(--sidebar-text)">
            <Filter class="w-5 h-5" /> Filters
          </h2>
          
          <div class="space-y-6">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-3" style="color: var(--sidebar-text)">Order Status</label>
              <div class="relative">
                <select 
                  v-model="filters.status" 
                  class="w-full rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer"
                  style="background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: var(--sidebar-text)"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none" style="color: var(--sidebar-text)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-3" style="color: var(--sidebar-text)">Date Range</label>
              <div class="flex flex-col gap-3">
                <input 
                  v-model="filters.dateFrom" 
                  type="date" 
                  class="w-full rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all"
                  style="background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: var(--sidebar-text)"
                />
                <input 
                  v-model="filters.dateTo" 
                  type="date" 
                  class="w-full rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all"
                  style="background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: var(--sidebar-text)"
                />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest mb-3" style="color: var(--sidebar-text)">Amount Range (₹)</label>
              <div class="flex gap-3">
                <input 
                  v-model="filters.minAmount" 
                  type="number" 
                  placeholder="Min" 
                  class="w-1/2 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all"
                  style="background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: var(--sidebar-text)"
                />
                <input 
                  v-model="filters.maxAmount" 
                  type="number" 
                  placeholder="Max" 
                  class="w-1/2 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all"
                  style="background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: var(--sidebar-text)"
                />
              </div>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t" style="border-color: rgba(255,255,255,0.1)">
            <button 
              @click="handleReindex" 
              :disabled="isReindexing"
              class="w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
              style="background-color: var(--accent-primary); color: white"
            >
              <div v-if="isReindexing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <RefreshCw v-else class="w-4 h-4" />
              {{ isReindexing ? 'Syncing...' : 'Rebuild Index' }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col gap-8">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 class="text-3xl font-black tracking-tighter" style="color: var(--text-primary)">Order Analytics</h1>
            <p class="mt-2 font-medium" style="color: var(--text-secondary)">Real-time store performance & management.</p>
          </div>
          
          <!-- Omni-Search Bar -->
          <div class="relative w-full md:w-[400px]">
            <Search class="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2" style="color: var(--text-secondary)" />
            <input 
              v-model="filters.keyword"
              type="text" 
              placeholder="Search orders, customers..."
              class="w-full rounded-lg py-3 pl-14 pr-6 text-sm font-bold focus:outline-none transition-all shadow-sm"
              style="background-color: var(--surface); border: 1px solid var(--border); color: var(--text-primary)"
            />
          </div>
        </div>
        
        <!-- KPI Dashboard -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0 }"
            class="p-6 rounded-xl shadow-sm relative overflow-hidden group transition-colors"
            style="background-color: var(--surface); border: 1px solid var(--border)"
          >
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style="background-color: var(--primary-light); color: var(--accent-primary)">
              <ShoppingBag class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-bold uppercase tracking-widest block mb-2" style="color: var(--text-secondary)">Total Orders</span>
            <span class="text-3xl font-black text-tabular" style="color: var(--text-primary)">{{ kpis?.totalOrders || 0 }}</span>
            <span class="text-xs mt-2 block" style="color: var(--text-secondary)">All time</span>
          </div>
          
          <div
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0 }"
            :transition="{ delay: 100 }"
            class="p-6 rounded-xl shadow-sm relative overflow-hidden group transition-colors"
            style="background-color: var(--surface); border: 1px solid var(--border)"
          >
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style="background-color: var(--primary-light); color: var(--accent-primary)">
              <DollarSign class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-bold uppercase tracking-widest block mb-2" style="color: var(--text-secondary)">Total Revenue</span>
            <span class="text-3xl font-black text-tabular" style="color: var(--text-primary)">{{ formatINR(kpis?.totalRevenueCents || 0) }}</span>
            <span class="text-xs mt-2 block" style="color: var(--text-secondary)">All time</span>
          </div>
        </div>

        <!-- Results Data Table -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ delay: 300 }"
          class="rounded-xl shadow-sm overflow-hidden"
          style="background-color: var(--surface); border: 1px solid var(--border)"
        >
          <div class="p-6 border-b flex justify-between items-center" style="border-color: var(--border)">
            <h3 class="font-black text-lg tracking-tighter" style="color: var(--text-primary)">Recent Orders</h3>
            <span class="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full" style="color: var(--text-secondary); background-color: var(--bg-base)">{{ results.length }} found</span>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
              <thead class="sticky top-0" style="background-color: var(--bg-base)">
                <tr class="text-[10px] uppercase tracking-widest" style="color: var(--text-secondary)">
                  <th class="p-4 font-bold border-b" style="border-color: var(--border)">Order ID</th>
                  <th class="p-4 font-bold border-b" style="border-color: var(--border)">Date</th>
                  <th class="p-4 font-bold border-b" style="border-color: var(--border)">Customer</th>
                  <th class="p-4 font-bold text-right border-b" style="border-color: var(--border)">Amount</th>
                  <th class="p-4 font-bold border-b" style="border-color: var(--border)">Status</th>
                  <th class="p-4 font-bold text-right border-b" style="border-color: var(--border)">Action</th>
                </tr>
              </thead>
              <tbody class="text-sm font-bold">
                <tr v-if="loading">
                  <td colspan="6" class="p-16 text-center">
                    <div class="w-10 h-10 border-4 rounded-full animate-spin mx-auto" style="border-color: var(--border); border-top-color: var(--accent-primary)"></div>
                  </td>
                </tr>
                <tr v-else-if="error">
                  <td colspan="6" class="p-16 text-center">
                    <div class="mx-auto max-w-md p-6 rounded-xl text-sm font-bold flex flex-col items-center gap-3" style="background-color: var(--danger-light); border-color: var(--danger); border: 1px solid; color: var(--danger)">
                      <AlertCircle class="w-6 h-6 shrink-0" />
                      <p>{{ error }}</p>
                      <button @click="fetchDashboardData" class="mt-4 px-4 py-2 bg-white text-red-600 rounded-lg shadow-sm">Try Again</button>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="results.length === 0">
                  <td colspan="6" class="p-20 text-center">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: var(--bg-base)">
                      <Search class="w-6 h-6" style="color: var(--text-secondary)" />
                    </div>
                    <p class="font-black text-lg tracking-tighter mb-2" style="color: var(--text-primary)">No orders match these filters</p>
                    <p class="text-sm font-medium" style="color: var(--text-secondary)">Try adjusting your search criteria.</p>
                  </td>
                </tr>
                <tr v-for="order in results" :key="order.id || order.orderId" class="border-b hover:bg-gray-50 transition-colors group" style="border-color: var(--border)">
                  <td class="p-4 font-black transition-colors cursor-pointer" style="color: var(--text-primary)">
                    <router-link :to="`/admin/orders/${order.id || order.orderId}`">#{{ order.id || order.orderId }}</router-link>
                  </td>
                  <td class="p-4 font-medium" style="color: var(--text-secondary)">{{ formatDate(order.orderDate || order.createdAt) }}</td>
                  <td class="p-4 flex items-center gap-3" style="color: var(--text-primary)">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style="background-color: var(--accent-primary)">
                      {{ (order.customer?.name || order.customer?.firstName || 'U').charAt(0).toUpperCase() }}
                    </div>
                    {{ order.customer?.name || order.customer?.firstName }}
                  </td>
                  <td class="p-4 font-black text-right text-tabular" style="color: var(--text-primary)">{{ formatINR(order.totalCents || order.totalMinor) }}</td>
                  <td class="p-4">
                    <span :class="[
                      'badge',
                      `badge-${order.status.toLowerCase()}`
                    ]">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <router-link :to="`/admin/orders/${order.id || order.orderId}`" class="inline-flex items-center justify-center p-2 rounded-lg transition-all" style="color: var(--text-secondary)">
                      <MoreHorizontal class="w-5 h-5" />
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-between items-center p-4 border-t" style="border-color: var(--border)">
            <button 
              :disabled="filters.page === 0" 
              @click="filters.page = filters.page - 1"
              class="w-10 h-10 rounded-lg border flex items-center justify-center disabled:opacity-30 transition-all"
              style="border-color: var(--border); color: var(--text-primary)"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <span class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--text-secondary)">
              Page {{ filters.page + 1 }} of {{ totalPages }}
            </span>
            <button 
              :disabled="filters.page === totalPages - 1"
              @click="filters.page = filters.page + 1"
              class="w-10 h-10 rounded-lg border flex items-center justify-center disabled:opacity-30 transition-all"
              style="border-color: var(--border); color: var(--text-primary)"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { Search, Filter, RefreshCw, ShoppingBag, DollarSign, MoreHorizontal, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-vue-next';
import { formatINR } from '../utils/currency';
import { useAdminStore } from '../stores/admin';
import api from '../services/api';

const adminStore = useAdminStore();

const kpis = ref(null);
const results = ref([]);
const loading = ref(true);
const error = ref(null);
const isReindexing = ref(false);

const filters = reactive({
  keyword: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
  page: 0,
  size: 20
});

const totalPages = ref(0);

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const searchParams = {
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      minAmount: filters.minAmount ? parseInt(filters.minAmount, 10) * 100 : undefined,
      maxAmount: filters.maxAmount ? parseInt(filters.maxAmount, 10) * 100 : undefined,
      page: filters.page,
      size: filters.size,
      sortBy: 'order_date',
      sortDir: 'desc'
    };

    // Remove undefined values
    Object.keys(searchParams).forEach(key => searchParams[key] === undefined && delete searchParams[key]);

    const searchRes = await api.post('/search/orders', searchParams);
    
    kpis.value = {
      totalOrders: searchRes.data.totalHits || 0,
      totalRevenueCents: searchRes.data.totalRevenue || 0,
      statusCounts: searchRes.data.statusCounts || {}
    };
    
    results.value = searchRes.data.orders || searchRes.data.data || [];
    totalPages.value = Math.ceil((searchRes.data.totalHits || 0) / (filters.size || 20));
  } catch (err) {
    console.error('Dashboard error:', err);
    error.value = 'Failed to load dashboard data. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleReindex = async () => {
  if (confirm('Trigger full reindex from MongoDB to OpenSearch?')) {
    isReindexing.value = true;
    try {
      await api.post('/admin/reindex');
      alert('Reindex triggered successfully!');
      fetchDashboardData();
    } catch (err) {
      alert('Reindex failed.');
    } finally {
      isReindexing.value = false;
    }
  }
};

// Watch filters for changes (skip page reset on initial run; only fire after mount)
let initialized = false;
watch(() => ({ ...filters }), () => {
  if (!initialized) return;
  filters.page = 0;
  fetchDashboardData();
}, { deep: true });

// Initial fetch — wait for store to restore token first
onMounted(async () => {
  if (!adminStore.isInitialized) {
    await adminStore.initializeAdmin();
  }
  initialized = true;
  fetchDashboardData();
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
