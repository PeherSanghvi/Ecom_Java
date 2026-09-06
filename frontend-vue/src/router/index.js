import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAdminStore } from '../stores/admin'

const routes = [
  {
    path: '/',
    component: () => import('../components/Layout.vue'),
    children: [
      { path: '', component: () => import('../pages/Home.vue') },
      { path: 'products', component: () => import('../pages/Products.vue') },
      { path: 'products/:id', component: () => import('../pages/ProductDetail.vue') },
      { path: 'search', component: () => import('../pages/Search.vue') },
      { path: 'cart', component: () => import('../pages/Cart.vue'), meta: { requiresAuth: true } },
      { path: 'checkout', component: () => import('../pages/Checkout.vue'), meta: { requiresAuth: true } },
      { path: 'orders', component: () => import('../pages/Orders.vue'), meta: { requiresAuth: true } },
      { path: 'orders/:id', component: () => import('../pages/OrderDetail.vue'), meta: { requiresAuth: true } },
      { path: 'order-success', component: () => import('../pages/OrderSuccess.vue') },
      { path: 'wishlist', component: () => import('../pages/Wishlist.vue') },
    ]
  },
  { path: '/login', component: () => import('../pages/Login.vue') },
  { path: '/register', component: () => import('../pages/Register.vue') },
  { path: '/admin/login', component: () => import('../pages/AdminLogin.vue') },
  // Catch-all: redirect any unmatched path to home
  { path: '/:pathMatch(.*)*', redirect: '/' },
  {
    path: '/admin',
    component: () => import('../components/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: 'dashboard', component: () => import('../pages/AdminDashboard.vue') },
      { path: 'orders', component: () => import('../pages/AdminOrders.vue') },
      { path: 'orders/:id', component: () => import('../pages/AdminOrderDetail.vue') },
      { path: '', redirect: 'dashboard' }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const adminStore = useAdminStore()

  if (!authStore.isInitialized) {
    await authStore.initializeUser()
  }
  if (!adminStore.isInitialized) {
    await adminStore.initializeAdmin()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { from: to.fullPath } })
  }

  if (to.meta.requiresAdmin && !adminStore.isAuthenticated) {
    return next({ path: '/admin/login', query: { from: to.fullPath } })
  }

  next()
})

export default router
