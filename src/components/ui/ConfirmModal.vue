<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ title?: string; message?: string }>()
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()

function onConfirm() { emit('confirm') }
function onCancel() { emit('cancel') }
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
    <div class="bg-white p-4 rounded shadow max-w-md w-full">
      <h3 class="font-semibold mb-2">{{ props.title || 'Confirm' }}</h3>
      <p class="mb-4">{{ props.message || 'Are you sure?' }}</p>
      <div class="flex justify-end gap-2">
        <button class="px-3 py-1 border rounded cursor-pointer hover:bg-gray-50" @click="onCancel">Cancel</button>
        <button class="px-3 py-1 bg-red-600 text-white rounded cursor-pointer hover:bg-red-700" @click="onConfirm">Confirm</button>
      </div>
    </div>
  </div>
</template>
