<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Warehouse, Package, Wrench, Settings, User, Users } from 'lucide-vue-next'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { path: '/containers', label: 'Containers', icon: Warehouse },
  { path: '/lots', label: 'Lots', icon: Package },
  { path: '/actions', label: 'Actions', icon: Wrench },
  { path: '/property-definition', label: 'Property Definitions', icon: Settings },
  { path: '/profile', label: 'Profile', icon: User }
]

const adminItems = [
  { path: '/admin/users', label: 'User Management', icon: Users }
]

const isActive = (path: string) => {
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="flex flex-col gap-1 p-4">
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
      :class="{ 'bg-gray-200 font-medium': isActive(item.path) }"
    >
      <component :is="item.icon" class="h-5 w-5" />
      <span>{{ item.label }}</span>
    </RouterLink>

    <!-- Admin Section -->
    <div v-if="authStore.isAdmin" class="mt-4 pt-4 border-t border-gray-200">
      <div class="px-3 mb-2">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</span>
      </div>
      <RouterLink
        v-for="item in adminItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
        :class="{ 'bg-gray-200 font-medium': isActive(item.path) }"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
