<script setup lang="ts">
import { LayoutGrid, Table2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  currentView: 'table' | 'cards'
}>()

const emit = defineEmits<{
  viewChange: [view: 'table' | 'cards']
}>()
</script>

<template>
  <div class="flex gap-1 rounded-lg border bg-white p-1">
    <Button
      variant="ghost"
      size="sm"
      :class="{ 'bg-gray-100': currentView === 'cards' }"
      @click="emit('viewChange', 'cards')"
      title="Card view"
    >
      <LayoutGrid class="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      :class="{ 'bg-gray-100': currentView === 'table' }"
      @click="emit('viewChange', 'table')"
      title="Table view"
    >
      <Table2 class="h-4 w-4" />
    </Button>
  </div>
</template>
