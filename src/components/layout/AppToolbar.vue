<script setup lang="ts">
import { Menu } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const emit = defineEmits<{
  toggleSidebar: []
}>()

const route = useRoute()

const pageTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/containers')) return 'Containers'
  if (path.startsWith('/lots')) return 'Lots'
  if (path.startsWith('/actions')) return 'Actions'
  if (path.startsWith('/property-definition')) return 'Property Definitions'
  return 'Home'
})
</script>

<template>
  <header class="flex items-center gap-4 border-b bg-white px-4 py-3">
    <Button variant="ghost" size="icon" @click="emit('toggleSidebar')">
      <Menu class="h-5 w-5" />
    </Button>
    <span class="flex-1 text-lg font-semibold">Real-Time Inventory</span>
    <span class="text-sm text-gray-600">{{ pageTitle }}</span>
  </header>
</template>
