<template>
  <div class="min-h-screen flex flex-col bg-base">
    <header class="border-b bg-surface sticky top-0 z-50">
      <!-- Navbar placeholder -->
      <div class="container-storefront py-4">Navbar</div>
    </header>

    <main class="flex-grow">
      <router-view />
    </main>

    <footer class="border-t bg-surface">
      <!-- Footer placeholder -->
      <div class="container-storefront py-6 text-center text-sm text-secondary">
        Footer
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>
