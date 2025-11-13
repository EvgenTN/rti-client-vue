<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Warehouse, Package, Wrench, Settings, User } from 'lucide-vue-next'
import { computed } from 'vue'

const route = useRoute()

const navItems = [
  { path: '/containers', label: 'Containers', icon: Warehouse },
  { path: '/lots', label: 'Lots', icon: Package },
  { path: '/actions', label: 'Actions', icon: Wrench },
  { path: '/property-definition', label: 'Property Definitions', icon: Settings },
  { path: '/profile', label: 'Profile', icon: User }
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
  </nav>
</template>
