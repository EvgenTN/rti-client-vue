<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'

defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-gray-500">
    <RefreshCw class="mb-4 h-8 w-8 animate-spin" />
    <span>{{ message || 'Loading...' }}</span>
  </div>
</template>
