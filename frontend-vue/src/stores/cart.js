import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: { items: [] },
    loading: false,
  }),
  getters: {
    totalItems: (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: (state) => state.cart.items.reduce((sum, item) => sum + (item.unitPriceCents * item.quantity), 0),
    shippingCents: () => 0,
    taxCents(state) {
      return Math.round(this.subtotalCents * 0.08);
    },
    totalCents(state) {
      return this.subtotalCents + this.shippingCents + this.taxCents;
    }
  },
  actions: {
    initializeCart() {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          this.cart = parsed && parsed.items ? parsed : { items: [] };
        } catch {
          this.cart = { items: [] };
        }
      }
    },
    saveCart(newCart) {
      this.cart = newCart;
      localStorage.setItem('cart', JSON.stringify(newCart));
    },
    addToCart(product, quantity = 1) {
      const productId = String(product._id || product.id).trim();
      if (!productId || productId === 'undefined' || productId === 'null') {
        console.error('Invalid product:', product);
        throw new Error('Product ID is required');
      }

      const existingIndex = this.cart.items.findIndex(item => item.productId === productId);
      const priceCents = product.price_minor ?? product.effectivePriceCents ?? product.priceCents ?? 0;
      
      let updatedItems;
      if (existingIndex >= 0) {
        updatedItems = this.cart.items.map((item, i) =>
          i === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updatedItems = [
          ...this.cart.items,
          {
            productId: productId,
            sku: product.sku || '',
            title: product.title || 'Untitled Product',
            brand: product.brand || 'AURA Exclusive',
            thumbnailUrl: product.thumbnailUrl || product.thumbnail || product.images?.[0] || '',
            unitPriceCents: Math.max(0, priceCents),
            quantity: Math.max(1, quantity),
          },
        ];
      }

      this.saveCart({ ...this.cart, items: updatedItems });
    },
    updateCartItem(productId, quantity) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
      const updatedItems = this.cart.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      this.saveCart({ ...this.cart, items: updatedItems });
    },
    removeFromCart(productId) {
      const updatedItems = this.cart.items.filter(item => item.productId !== productId);
      this.saveCart({ ...this.cart, items: updatedItems });
    },
    clearCart() {
      this.saveCart({ items: [] });
    }
  }
});
