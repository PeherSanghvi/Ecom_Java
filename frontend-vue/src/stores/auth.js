import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true,
    isInitialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user && !!state.user._id,
  },
  actions: {
    async initializeUser() {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (userData._id && userData.email) {
              this.user = userData;
              // Restore token into axios default headers if present
              if (savedToken) {
                api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
              }
            } else {
              this.clearUser();
            }
          } catch (parseError) {
            console.error('Failed to parse saved user:', parseError);
            this.clearUser();
          }
        } else {
          this.clearUser();
        }
      } finally {
        this.loading = false;
        this.isInitialized = true;
      }
    },
    clearUser() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.user = null;
      delete api.defaults.headers.common['Authorization'];
    },
    async login(email, password) {
      try {
        if (!email || typeof email !== 'string' || !email.trim()) {
          return { success: false, error: 'Email is required' };
        }
        
        if (!password || typeof password !== 'string' || !password.trim()) {
          return { success: false, error: 'Password is required' };
        }
        
        const response = await api.post('/auth/login', { email, password });
        if (response.data?.success && response.data?.user) {
          const userData = response.data.user;
          if (!userData._id || !userData.email) {
            console.error('Invalid user response from server:', userData);
            return { success: false, error: 'Invalid user data received' };
          }
          this.user = userData;
          localStorage.setItem('user', JSON.stringify(userData));
          // Store token so api interceptor and axios defaults both work
          const token = response.data.token;
          if (token) {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
          return { success: true };
        }
        return { success: false, error: response.data?.error || 'Login failed' };
      } catch (error) {
        console.error('Login error:', error);
        return { 
          success: false, 
          error: error.response?.data?.error || error.message || 'Login failed' 
        };
      }
    },
    async register(firstName, lastName, email, password, phone = '', address = null) {
      try {
        if (!firstName || !lastName || !email) {
          return { success: false, error: 'Name and email are required' };
        }
        
        if (!password || password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        if (!address) {
          return { success: false, error: 'Address is required' };
        }
        
        const response = await api.post('/auth/register', {
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
          phone: phone || '9876543210',
          address
        });
        
        if (response.data?.success && response.data?.user) {
          const userData = response.data.user;
          if (!userData._id || !userData.email) {
            console.error('Invalid user response from server:', userData);
            return { success: false, error: 'Invalid user data received' };
          }
          this.user = userData;
          localStorage.setItem('user', JSON.stringify(userData));
          // Store token from registration response
          const token = response.data.token;
          if (token) {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
          return { success: true };
        }
        return { success: false, error: response.data?.error || 'Registration failed' };
      } catch (error) {
        console.error('Register error:', error);
        return { 
          success: false, 
          error: error.response?.data?.error || error.message || 'Registration failed' 
        };
      }
    },
    logout() {
      this.clearUser();
    }
  }
});
