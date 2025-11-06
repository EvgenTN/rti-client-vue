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
import { LotService, type Lot } from '@/lib/lot-api'
import { ActionService } from '@/lib/action-api'
import LoadingState from '@/components/ui/LoadingState.vue'

const lotName = ref('')
const containerName = ref('')
const quantity = ref<number | ''>('')
const lots = ref<Lot[]>([])
const containers = ref<Container[]>([])
const loadingLots = ref(false)
const loadingContainers = ref(false)
const submitting = ref(false)

const loading = computed(() => loadingLots.value || loadingContainers.value)

const isFormValid = computed(() => {
  return (
    lotName.value.trim() !== '' &&
    containerName.value.trim() !== '' &&
    quantity.value !== '' &&
    Number(quantity.value) >= 0
  )
})

async function loadLots() {
  loadingLots.value = true
  try {
    lots.value = await LotService.getAll()
  } catch (e) {
    console.error('Failed to load lots:', e)
  } finally {
    loadingLots.value = false
  }
}

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
    await ActionService.updateLotQuantity({
      lotName: lotName.value,
      containerName: containerName.value,
      quantity: Number(quantity.value),
    })

    // Reset form
    lotName.value = ''
    containerName.value = ''
    quantity.value = ''
  } catch (e) {
    console.error('Failed to update lot quantity:', e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadLots()
  loadContainers()
})
</script>

<template>
  <div>
    <div v-if="loading" class="py-8">
      <LoadingState message="Loading data..." />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Lot Selection -->
      <div class="space-y-2">
        <Label for="lot-name">Lot</Label>
        <Select v-model="lotName">
          <SelectTrigger id="lot-name">
            <SelectValue placeholder="Select lot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="lot in lots" :key="lot.name" :value="lot.name">
              {{ lot.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Container Selection -->
      <div class="space-y-2">
        <Label for="container-name">Container</Label>
        <Select v-model="containerName">
          <SelectTrigger id="container-name">
            <SelectValue placeholder="Select container" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="container in containers" :key="container.name" :value="container.name">
              {{ container.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Quantity -->
      <div class="space-y-2">
        <Label for="quantity">Quantity</Label>
        <Input
          id="quantity"
          v-model="quantity"
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter new quantity"
          required
        />
        <p class="text-sm text-muted-foreground">
          Set the quantity of this lot in the selected container. Use 0 to remove the lot from the
          container.
        </p>
      </div>

      <!-- Summary -->
      <div
        v-if="lotName && containerName && quantity !== ''"
        class="p-4 bg-muted rounded-lg space-y-1"
      >
        <div class="text-sm font-medium">Summary</div>
        <div class="text-sm text-muted-foreground">
          Set <span class="font-medium text-foreground">{{ lotName }}</span> quantity in
          <span class="font-medium text-foreground">{{ containerName }}</span> to
          <span class="font-medium text-foreground">{{ quantity }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end pt-4">
        <Button type="submit" :disabled="!isFormValid || submitting">
          {{ submitting ? 'Updating...' : 'Update Quantity' }}
        </Button>
      </div>
    </form>
  </div>
</template>
