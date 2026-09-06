import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admin: null,
    token: null,
    loading: true,
    isInitialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.admin && !!state.admin._id && state.admin.role === 'ADMIN',
    isAdmin: (state) => state.admin?.role === 'ADMIN',
  },
  actions: {
    async initializeAdmin() {
      try {
        const savedAdmin = localStorage.getItem('admin');
        const savedToken = localStorage.getItem('adminToken');
        if (savedAdmin && savedToken) {
          try {
            const adminData = JSON.parse(savedAdmin);
            if (adminData._id && adminData.email && adminData.role === 'ADMIN') {
              this.admin = adminData;
              this.token = savedToken;
              api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
              api.defaults.headers.common['X-Admin-Token'] = savedToken;
              api.defaults.headers.common['X-User-Id'] = adminData._id;
              api.defaults.headers.common['X-User-Role'] = 'ADMIN';
            } else {
              this.clearAdmin();
            }
          } catch (parseError) {
            console.error('Failed to parse saved admin:', parseError);
            this.clearAdmin();
          }
        } else {
          this.clearAdmin();
        }
      } finally {
        this.loading = false;
        this.isInitialized = true;
      }
    },
    clearAdmin() {
      localStorage.removeItem('admin');
      localStorage.removeItem('adminToken');
      this.admin = null;
      this.token = null;
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['X-Admin-Token'];
      delete api.defaults.headers.common['X-User-Id'];
      delete api.defaults.headers.common['X-User-Role'];
    },
    async login(email, password) {
      try {
        if (!email || typeof email !== 'string' || !email.trim()) {
          return { success: false, error: 'Email is required' };
        }
        if (!password) {
          return { success: false, error: 'Password is required' };
        }
        
        const response = await api.post('/auth/admin/login', { email, password });
        if (response.data?.success && response.data?.user) {
          const adminData = response.data.user;
          const adminToken = response.data.token;
          if (!adminData._id || !adminData.email || adminData.role !== 'ADMIN') {
            return { success: false, error: 'Invalid admin credentials' };
          }
          this.admin = adminData;
          this.token = adminToken;
          localStorage.setItem('admin', JSON.stringify(adminData));
          if (adminToken) {
            localStorage.setItem('adminToken', adminToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
            api.defaults.headers.common['X-Admin-Token'] = adminToken;
            api.defaults.headers.common['X-User-Id'] = adminData._id;
            api.defaults.headers.common['X-User-Role'] = 'ADMIN';
          }
          return { success: true };
        }
        return { success: false, error: response.data?.error || 'Admin login failed' };
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.error || error.message || 'Admin login failed' 
        };
      }
    },
    logout() {
      this.clearAdmin();
    }
  }
});
