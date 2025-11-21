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
  <div class="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="emit('toggleSidebar')" class="h-9 w-9">
        <Menu class="h-5 w-5" />
      </Button>
      <span class="text-base font-semibold text-gray-700">{{ pageTitle }}</span>
    </div>
  </div>
</template>
