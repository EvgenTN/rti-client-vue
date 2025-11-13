<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import AppToolbar from '@/components/layout/AppToolbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(true)

// Show layout components only when authenticated and not on login page
const showLayout = computed(() => authStore.isAuthenticated && route.path !== '/login')

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

onMounted(async () => {
  // Auth state is already loaded from localStorage during store initialization
  // Fetch current user if we have a token to ensure it's still valid
  if (authStore.isAuthenticated) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      // If token is invalid, clear auth state
      authStore.clearAuth()
    }
  }
})
</script>

<template>
  <div class="flex h-screen flex-col">
    <!-- Show header only when authenticated -->
    <AppHeader v-if="showLayout" />
    
    <!-- Show toolbar and sidebar only when authenticated and not on login -->
    <template v-if="showLayout">
      <AppToolbar @toggle-sidebar="toggleSidebar" />
      <div class="flex flex-1 overflow-hidden">
        <aside
          v-if="sidebarOpen"
          class="w-64 border-r bg-white overflow-y-auto"
        >
          <AppSidebar />
        </aside>
        <main class="flex-1 overflow-y-auto bg-gray-50 p-4">
          <RouterView />
        </main>
      </div>
    </template>
    
    <!-- Show only content on login page -->
    <template v-else>
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </template>
  </div>
</template>

<style scoped></style>
