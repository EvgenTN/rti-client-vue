<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue'
import AppToolbar from '@/components/layout/AppToolbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const sidebarOpen = ref(true)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="flex h-screen flex-col">
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
  </div>
</template>

<style scoped></style>
