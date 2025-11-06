<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '@/lib/toast'

const { toasts, remove } = useToast()
const list = computed(() => toasts.value)
</script>

<template>
  <div class="fixed bottom-4 right-4 space-y-2 z-50">
    <div v-for="t in list" :key="t.id" :class="['p-3 rounded shadow-md', t.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white']">
      <div class="flex items-start gap-3">
        <div class="flex-1">{{ t.message }}</div>
        <button @click="remove(t.id)" class="opacity-80 hover:opacity-100 cursor-pointer">✕</button>
      </div>
    </div>
  </div>
</template>
