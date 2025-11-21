<template>
  <header class="bg-white border-b">
    <div class="px-4 py-3 flex justify-between items-center">
      <h1 class="text-xl font-bold text-gray-900">Real-Time Inventory</h1>
      
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
        <router-link
          to="/profile"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <span class="text-sm font-medium text-gray-700">{{ authStore.user?.fullName || authStore.user?.email }}</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
            {{ authStore.user?.role }}
          </span>
        </router-link>
        
        <button
          @click="handleLogout"
          class="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/lib/toast'

const router = useRouter()
const authStore = useAuthStore()
const { show: showToast } = useToast()

async function handleLogout() {
  try {
    await authStore.logout()
    showToast('Successfully logged out', 'success')
    router.push('/login')
  } catch (error: any) {
    showToast(error.message || 'Logout failed', 'error')
  }
}
</script>
