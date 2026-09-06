<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full">
    <Skeleton variant="card" className="h-48 w-full rounded-none" />
    <div class="p-4 space-y-3 flex-1 flex flex-col">
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-2/3" />
      <Skeleton variant="title" className="w-1/3 mt-2" />
      <div class="mt-auto pt-4">
        <Skeleton variant="button" className="w-full rounded-full" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from './Skeleton.vue';
</script>
