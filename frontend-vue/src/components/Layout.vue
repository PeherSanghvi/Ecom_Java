<template>
  <div class="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
    <Navbar />

    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <router-view />
    </main>

    <footer class="bg-gray-800 text-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-lg font-bold mb-4 flex items-center gap-1">
              <span class="text-orange-400">a</span>
              mazon<span class="text-orange-400 text-sm">POC</span>
            </h3>
            <p class="text-gray-400 text-sm">
              Proof of concept integrating MongoDB Community Edition with OpenSearch.
            </p>
          </div>
          <div>
            <h3 class="font-semibold mb-4 text-gray-300">Get to Know Us</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#" class="hover:underline">Careers</a></li>
              <li><a href="#" class="hover:underline">Blog</a></li>
              <li><a href="#" class="hover:underline">About Amazon</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-4 text-gray-300">Make Money with Us</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#" class="hover:underline">Sell products</a></li>
              <li><a href="#" class="hover:underline">Sell apps</a></li>
              <li><a href="#" class="hover:underline">Become an Affiliate</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-4 text-gray-300">Let Us Help You</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#" class="hover:underline">Your Account</a></li>
              <li><a href="#" class="hover:underline">Your Orders</a></li>
              <li><a href="#" class="hover:underline">Help</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2026 AmazonPOC. Proof of concept assignment.</p>
          <div class="flex gap-4 mt-4 md:mt-0">
            <a href="#" class="hover:underline">Conditions of Use</a>
            <a href="#" class="hover:underline">Privacy Notice</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Navbar from './Navbar.vue';
import { useCartStore } from '../stores/cart';
import { useWishlistStore } from '../stores/wishlist';

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

onMounted(() => {
  cartStore.initializeCart();
  wishlistStore.initializeWishlist();
});
</script>
