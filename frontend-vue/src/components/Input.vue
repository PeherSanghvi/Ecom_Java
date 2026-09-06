<template>
  <div :class="['mb-4', containerClassName]">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    <div class="relative">
      <div v-if="$slots.icon || icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="icon">
          <component :is="icon" v-if="icon" />
        </slot>
      </div>
      <input
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :class="[
          'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all',
          error ? 'border-red-500' : 'border-gray-300',
          ($slots.icon || icon) ? 'pl-10' : '',
          className
        ]"
      />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  error: String,
  icon: [Object, Function, String],
  className: {
    type: String,
    default: ''
  },
  containerClassName: {
    type: String,
    default: ''
  },
  modelValue: [String, Number]
});
defineEmits(['update:modelValue']);
</script>
