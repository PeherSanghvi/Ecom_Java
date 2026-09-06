import { defineStore } from 'pinia';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    wishlist: [],
    loading: false,
  }),
  actions: {
    initializeWishlist() {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          this.wishlist = Array.isArray(parsed) ? parsed : [];
        } catch {
          this.wishlist = [];
        }
      }
    },
    saveWishlist(newWishlist) {
      this.wishlist = newWishlist;
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    },
    addToWishlist(product) {
      const productId = typeof product === 'string' ? product : (product._id || product.id);
      if (productId && !this.wishlist.includes(productId)) {
        this.saveWishlist([...this.wishlist, productId]);
      }
    },
    removeFromWishlist(productId) {
      this.saveWishlist(this.wishlist.filter(id => id !== productId));
    },
    isInWishlist(productId) {
      return this.wishlist.includes(productId);
    }
  }
});
