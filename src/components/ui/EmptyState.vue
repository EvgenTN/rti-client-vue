<script setup lang="ts">
import { Package } from 'lucide-vue-next'
import type { Component } from 'vue'

export interface EmptyStateProps {
  icon?: Component
  title: string
  description?: string
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  icon: () => Package
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-12 text-center text-gray-500">
    <component :is="props.icon" class="mb-4 h-16 w-16 opacity-50" />
    <h3 class="mb-2 text-lg font-semibold text-gray-900">{{ props.title }}</h3>
    <p v-if="props.description" class="text-sm">{{ props.description }}</p>
  </div>
</template>
