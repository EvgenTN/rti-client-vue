<template>
  <div v-if="modelValue && user" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Change User Role</h3>
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

          <div class="text-sm text-gray-600 space-y-2">
            <p><strong>User:</strong> {{ user.email }}</p>
            <p><strong>Current Role:</strong> <span :class="`text-${ROLE_INFO[user.role as keyof typeof ROLE_INFO]?.color || 'gray'}-600 font-semibold`">{{ user.role }}</span></p>
          </div>

          <div>
            <label for="newRole" class="block text-sm font-medium text-gray-700">New Role *</label>
            <select
              id="newRole"
              v-model="newRole"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a role</option>
              <option v-for="role in USER_ROLES" :key="role" :value="role">
                {{ ROLE_INFO[role].displayName }}
              </option>
            </select>
          </div>

          <div v-if="newRole && newRole !== user.role" class="rounded-md bg-blue-50 p-4">
            <p class="text-sm text-blue-800 font-medium">{{ ROLE_INFO[newRole as keyof typeof ROLE_INFO].displayName }}</p>
            <p class="text-xs text-blue-700 mt-1">{{ ROLE_INFO[newRole as keyof typeof ROLE_INFO].description }}</p>
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
              :disabled="isLoading || !newRole || newRole === user.role"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Changing...' : 'Change Role' }}
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
import { USER_ROLES, ROLE_INFO, type UserListItem } from '@/models/user-management'
import { useToast } from '@/lib/toast'

const props = defineProps<{
  modelValue: boolean
  user: UserListItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'changed': []
}>()

const { show: showToast } = useToast()

const newRole = ref('')
const isLoading = ref(false)
const error = ref('')

watch(() => [props.modelValue, props.user] as const, ([newVal, newUser]) => {
  if (newVal && newUser) {
    newRole.value = newUser.role
    error.value = ''
  }
})

function close() {
  emit('update:modelValue', false)
}

async function handleSubmit() {
  if (!props.user || !newRole.value) return

  error.value = ''
  isLoading.value = true
  try {
    await UserManagementService.changeUserRole(props.user.id, { role: newRole.value })
    showToast('Role changed successfully', 'success')
    emit('changed')
    close()
  } catch (err: any) {
    error.value = err.message || 'Failed to change role'
    showToast(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>
