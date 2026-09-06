<template>
  <div :class="[baseClasses, variants[variant], className]"></div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  className: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default'
  }
});

const baseClasses = 'animate-pulse bg-gray-200 rounded';

const variants = {
  default: 'h-4 w-full',
  text: 'h-4 w-3/4',
  title: 'h-8 w-1/2',
  avatar: 'h-12 w-12 rounded-full',
  card: 'h-48 w-full',
  button: 'h-10 w-24',
  input: 'h-10 w-full'
};
</script>
