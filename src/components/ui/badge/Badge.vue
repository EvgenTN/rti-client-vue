<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'outline'
  class?: string
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default',
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  
  const variantClasses = {
    default: 'border-transparent bg-gray-900 text-white shadow hover:bg-gray-800',
    secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-gray-300 text-gray-700',
  }
  
  return cn(baseClasses, variantClasses[props.variant], props.class)
})
</script>

<template>
  <div :class="badgeClasses">
    <slot />
  </div>
</template>
