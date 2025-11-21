<template>
  <div v-if="modelValue && user" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Reset Password</h3>
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

          <div class="text-sm text-gray-600 mb-4">
            <p><strong>User:</strong> {{ user.email }}</p>
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password *</label>
            <input
              id="newPassword"
              v-model="form.newPassword"
              type="password"
              required
              minlength="6"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p class="mt-1 text-xs text-gray-500">Must contain uppercase, lowercase, digit, and special character</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password *</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <button
            type="button"
            @click="generatePassword"
            class="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate Random Password
          </button>

          <div v-if="generatedPassword" class="rounded-md bg-green-50 p-3">
            <p class="text-xs font-medium text-green-800">Generated Password (copy this):</p>
            <p class="text-sm font-mono text-green-900 mt-1 break-all">{{ generatedPassword }}</p>
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
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
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
import type { UserListItem, ResetPasswordRequest } from '@/models/user-management'
import { useToast } from '@/lib/toast'

const props = defineProps<{
  modelValue: boolean
  user: UserListItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'reset': []
}>()

const { show: showToast } = useToast()

const form = ref<ResetPasswordRequest>({
  newPassword: ''
})

const confirmPassword = ref('')
const generatedPassword = ref('')
const isLoading = ref(false)
const error = ref('')

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    form.value.newPassword = ''
    confirmPassword.value = ''
    generatedPassword.value = ''
    error.value = ''
  }
})

function close() {
  emit('update:modelValue', false)
}

function generatePassword() {
  const length = 12
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  const special = '!@#$%^&*'
  const all = uppercase + lowercase + digits + special

  let password = ''
  // Ensure at least one of each required character type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += digits[Math.floor(Math.random() * digits.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // Shuffle the password
  password = password.split('').sort(() => Math.random() - 0.5).join('')

  generatedPassword.value = password
  form.value.newPassword = password
  confirmPassword.value = password
}

async function handleSubmit() {
  if (!props.user) return

  error.value = ''

  // Validate passwords match
  if (form.value.newPassword !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true
  try {
    await UserManagementService.resetUserPassword(props.user.id, form.value)
    showToast('Password reset successfully', 'success')
    emit('reset')
    close()
  } catch (err: any) {
    error.value = err.message || 'Failed to reset password'
    showToast(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>
