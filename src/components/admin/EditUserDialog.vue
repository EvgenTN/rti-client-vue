<template>
  <div v-if="modelValue && user" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Edit User</h3>
          <button @click="close" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <div class="text-sm text-gray-500 mb-4">
            <p><strong>Email:</strong> {{ user.email }}</p>
          </div>

          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              type="tel"
              placeholder="+1234567890"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p class="mt-1 text-xs text-gray-500">E.164 format (e.g., +1234567890)</p>
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
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Updating...' : 'Update User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UserManagementService } from '@/lib/user-management-api'
import type { UserListItem, UpdateUserRequest } from '@/models/user-management'
import { useToast } from '@/lib/toast'

const props = defineProps<{
  modelValue: boolean
  user: UserListItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'updated': []
}>()

const { show: showToast } = useToast()

const form = ref<UpdateUserRequest>({
  firstName: '',
  lastName: '',
  phoneNumber: ''
})

const isLoading = ref(false)
const error = ref('')

watch(() => [props.modelValue, props.user] as const, ([newVal, newUser]) => {
  if (newVal && newUser) {
    form.value = {
      firstName: newUser.firstName || '',
      lastName: newUser.lastName || '',
      phoneNumber: ''
    }
    error.value = ''
  }
})

function close() {
  emit('update:modelValue', false)
}

async function handleSubmit() {
  if (!props.user) return

  error.value = ''
  isLoading.value = true
  try {
    await UserManagementService.updateUser(props.user.id, form.value)
    showToast('User updated successfully', 'success')
    emit('updated')
    close()
  } catch (err: any) {
    error.value = err.message || 'Failed to update user'
    showToast(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>
