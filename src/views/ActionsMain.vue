<script setup lang="ts">
import { ref } from 'vue'
import { Package2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Toast from '@/components/ui/Toast.vue'
import MoveMaterialsForm from '@/components/actions/MoveMaterialsForm.vue'
import UpdateLotQuantityForm from '@/components/actions/UpdateLotQuantityForm.vue'
import { useToast } from '@/lib/toast'

type TabType = 'move' | 'update'
const activeTab = ref<TabType>('move')
const { toasts } = useToast()
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 bg-primary/10 rounded-lg">
          <Package2 class="h-8 w-8 text-primary" />
        </div>
        <h1 class="text-3xl font-bold">Actions</h1>
      </div>
      <p class="text-muted-foreground">
        Perform inventory operations such as moving materials and updating quantities
      </p>
    </div>

    <!-- Tabs -->
    <Card class="overflow-hidden">
      <!-- Tab Headers -->
      <div class="border-b">
        <div class="flex">
          <button
            @click="activeTab = 'move'"
            :class="[
              'px-6 py-3 font-medium transition-colors relative',
              activeTab === 'move'
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            ]"
          >
            Move Materials
            <div
              v-if="activeTab === 'move'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          </button>
          <button
            @click="activeTab = 'update'"
            :class="[
              'px-6 py-3 font-medium transition-colors relative',
              activeTab === 'update'
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            ]"
          >
            Update Lot Quantity
            <div
              v-if="activeTab === 'update'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <MoveMaterialsForm v-if="activeTab === 'move'" />
        <UpdateLotQuantityForm v-if="activeTab === 'update'" />
      </div>
    </Card>

    <!-- Toast Notifications -->
    <Toast :toasts="toasts" />
  </div>
</template>

