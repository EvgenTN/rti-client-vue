<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('rounded-lg border bg-white shadow-sm', $props.class)">
    <slot />
  </div>
</template>
