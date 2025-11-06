<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ContainerService, type Container } from '@/lib/container-api'
import { ActionService } from '@/lib/action-api'
import LoadingState from '@/components/ui/LoadingState.vue'
import { ArrowRight } from 'lucide-vue-next'

const sourceContainerName = ref('')
const destinationContainerName = ref('')
const quantity = ref<number | ''>('')
const containers = ref<Container[]>([])
const loadingContainers = ref(false)
const submitting = ref(false)

const isFormValid = computed(() => {
  return (
    sourceContainerName.value.trim() !== '' &&
    destinationContainerName.value.trim() !== '' &&
    sourceContainerName.value !== destinationContainerName.value &&
    quantity.value !== '' &&
    Number(quantity.value) > 0
  )
})

const availableDestinations = computed(() => {
  return containers.value.filter((c) => c.name !== sourceContainerName.value)
})

async function loadContainers() {
  loadingContainers.value = true
  try {
    containers.value = await ContainerService.getAll()
  } catch (e) {
    console.error('Failed to load containers:', e)
  } finally {
    loadingContainers.value = false
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return

  submitting.value = true
  try {
    await ActionService.moveMaterials({
      sourceContainerName: sourceContainerName.value,
      destinationContainerName: destinationContainerName.value,
      quantity: Number(quantity.value),
    })

    // Reset form
    sourceContainerName.value = ''
    destinationContainerName.value = ''
    quantity.value = ''
  } catch (e) {
    console.error('Failed to move materials:', e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadContainers()
})
</script>

<template>
  <div>
    <div v-if="loadingContainers" class="py-8">
      <LoadingState message="Loading containers..." />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Container Selection -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Source Container -->
        <div class="space-y-2">
          <Label for="source-container">Source Container</Label>
          <Select v-model="sourceContainerName">
            <SelectTrigger id="source-container">
              <SelectValue placeholder="Select source container" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="container in containers" :key="container.name" :value="container.name">
                {{ container.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Destination Container -->
        <div class="space-y-2">
          <Label for="destination-container">Destination Container</Label>
          <Select v-model="destinationContainerName">
            <SelectTrigger id="destination-container">
              <SelectValue placeholder="Select destination container" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="container in availableDestinations"
                :key="container.name"
                :value="container.name"
              >
                {{ container.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Quantity -->
      <div class="space-y-2">
        <Label for="quantity">Quantity to Move</Label>
        <Input
          id="quantity"
          v-model="quantity"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Enter quantity"
          required
        />
      </div>

      <!-- Visual Transfer Indicator -->
      <div
        v-if="sourceContainerName && destinationContainerName"
        class="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg"
      >
        <div class="text-center">
          <div class="text-sm font-medium">{{ sourceContainerName }}</div>
          <div class="text-xs text-muted-foreground">Source</div>
        </div>
        <ArrowRight class="h-5 w-5 text-primary" />
        <div class="text-center">
          <div class="text-sm font-medium">{{ destinationContainerName }}</div>
          <div class="text-xs text-muted-foreground">Destination</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end pt-4">
        <Button type="submit" :disabled="!isFormValid || submitting">
          {{ submitting ? 'Moving...' : 'Move Materials' }}
        </Button>
      </div>
    </form>
  </div>
</template>
