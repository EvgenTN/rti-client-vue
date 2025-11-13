<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold text-gray-900">Real-Time Inventory</h1>
      </div>
      
      <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
        <router-link
          to="/profile"
          class="text-sm text-gray-700 hover:text-gray-900 flex items-center"
        >
          <span>{{ authStore.user?.fullName || authStore.user?.email }}</span>
          <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {{ authStore.user?.role }}
          </span>
        </router-link>
        
        <button
          @click="handleLogout"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
