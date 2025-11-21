<template>
  <div v-if="modelValue && user" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="ml-4 text-lg font-medium text-gray-900">Delete User</h3>
          </div>
          <button @click="close" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <div class="text-sm text-gray-600">
            <p class="mb-2">Are you sure you want to delete this user?</p>
            <div class="bg-gray-50 rounded p-3 space-y-1">
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p v-if="user.firstName || user.lastName">
                <strong>Name:</strong> {{ user.firstName }} {{ user.lastName }}
              </p>
              <p><strong>Role:</strong> {{ user.role }}</p>
            </div>
          </div>

          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Warning</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>This action cannot be undone. The user will be permanently deleted from the system.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleDelete"
              :disabled="isLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Deleting...' : 'Delete User' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserManagementService } from '@/lib/user-management-api'
import type { UserListItem } from '@/models/user-management'
import { useToast } from '@/lib/toast'

const props = defineProps<{
  modelValue: boolean
  user: UserListItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'deleted': []
}>()

const { show: showToast } = useToast()

const isLoading = ref(false)
const error = ref('')

function close() {
  emit('update:modelValue', false)
  error.value = ''
}

async function handleDelete() {
  if (!props.user) return

  error.value = ''
  isLoading.value = true
  try {
    await UserManagementService.deleteUser(props.user.id)
    showToast('User deleted successfully', 'success')
    emit('deleted')
    close()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete user'
    showToast(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>
