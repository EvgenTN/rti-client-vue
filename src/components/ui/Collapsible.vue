<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'

defineProps<{
  title?: string
  subtitle?: string
  defaultOpen?: boolean
}>()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="border rounded-lg overflow-hidden">
    <button
      @click="toggle"
      class="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
    >
      <div class="flex items-center gap-4 flex-1">
        <slot name="header">
          <div class="flex items-center gap-2 flex-1">
            <span class="font-medium">{{ title }}</span>
          </div>
        </slot>
        <div v-if="subtitle" class="flex items-center gap-2 text-gray-600">
          <span class="text-sm">{{ subtitle }}</span>
        </div>
      </div>
      <component :is="isOpen ? ChevronUp : ChevronDown" class="h-5 w-5 text-gray-400" />
    </button>
    
    <div
      v-show="isOpen"
      class="border-t bg-white"
    >
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
</template>
