<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LotService, type LotDetails, type LotLocation } from '@/lib/lot-api'
import { ActionService } from '@/lib/action-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Pencil, Info, Package, Eye, Save, X } from 'lucide-vue-next'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Card from '@/components/ui/Card.vue'
import Toast from '@/components/ui/Toast.vue'
import Collapsible from '@/components/ui/Collapsible.vue'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import { useToast } from '@/lib/toast'

const route = useRoute()
const router = useRouter()
const { toasts } = useToast()
const loading = ref(false)
const lot = ref<LotDetails | null>(null)
const editingLocationKey = ref<string | null>(null)
const editedQuantity = ref<number>(0)

const lotName = computed(() => route.params.name as string)

// Group locations by container
const aggregatedLocations = computed(() => {
  if (!lot.value) return []
  
  const locationsMap = new Map<string, {
    containerName: string
    totalQuantity: number
    entries: LotLocation[]
  }>()
  
  lot.value.locations.forEach(location => {
    if (!locationsMap.has(location.containerName)) {
      locationsMap.set(location.containerName, {
        containerName: location.containerName,
        totalQuantity: 0,
        entries: []
      })
    }
    const aggregated = locationsMap.get(location.containerName)!
    aggregated.totalQuantity += location.quantity
    aggregated.entries.push(location)
  })
  
  return Array.from(locationsMap.values())
})

function getLocationKey(location: LotLocation): string {
  return `${location.containerName}|${location.inputTimestamp}`
}

async function loadLotDetails() {
  loading.value = true
  try {
    lot.value = await LotService.getDetails(lotName.value)
  } catch (error) {
    console.error('Failed to load lot details:', error)
    router.push('/lots')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/lots')
}

function editLot() {
  router.push(`/lots/${lotName.value}/edit`)
}

function viewContainerDetails(containerName: string) {
  router.push(`/container/${encodeURIComponent(containerName)}/info`)
}

function startEditingQuantity(location: LotLocation) {
  editingLocationKey.value = getLocationKey(location)
  editedQuantity.value = location.quantity
}

function cancelEditing() {
  editingLocationKey.value = null
  editedQuantity.value = 0
}

async function saveQuantity(location: LotLocation) {
  if (editedQuantity.value < 0) return
  
  try {
    await ActionService.updateLotQuantity({
      lotName: lotName.value,
      containerName: location.containerName,
      quantity: editedQuantity.value
    })
    
    // Update local state
    if (lot.value) {
      const locationEntry = lot.value.locations.find(l => getLocationKey(l) === getLocationKey(location))
      if (locationEntry) {
        locationEntry.quantity = editedQuantity.value
      }
    }
    editingLocationKey.value = null
  } catch (error) {
    console.error('Failed to update quantity:', error)
    cancelEditing()
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  loadLotDetails()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Lot Details</h1>
        <p v-if="lot" class="text-gray-600">
          Details for lot: <span class="font-semibold">{{ lot.name }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="goBack">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to Lots
        </Button>
        <Button v-if="lot" @click="editLot">
          <Pencil class="mr-2 h-4 w-4" />
          Edit Lot
        </Button>
      </div>
    </div>

    <LoadingState v-if="loading" message="Loading lot details..." />

    <div v-else-if="lot" class="grid gap-6 lg:grid-cols-2">
      <!-- Properties Card -->
      <Card>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">Properties</h2>
          <div v-if="lot.properties && lot.properties.length > 0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="prop in lot.properties" :key="prop.name">
                  <TableCell class="font-medium">{{ prop.name }}</TableCell>
                  <TableCell>{{ prop.value }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <EmptyState
            v-else
            :icon="Info"
            title="No properties defined"
            description="This lot has no properties assigned."
          />
        </div>
      </Card>

      <!-- Locations Card -->
      <Card>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">Locations</h2>
          
          <div v-if="aggregatedLocations.length > 0" class="space-y-2">
            <Collapsible
              v-for="location in aggregatedLocations"
              :key="location.containerName"
              :title="location.containerName"
            >
              <template #header>
                <div class="flex items-center gap-2 flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    @click.stop="viewContainerDetails(location.containerName)"
                    class="h-8 w-8"
                  >
                    <Eye class="h-4 w-4" />
                  </Button>
                  <span class="font-medium">{{ location.containerName }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <span class="text-sm">Total:</span>
                  <span class="font-semibold">{{ location.totalQuantity.toFixed(2) }}</span>
                </div>
              </template>

              <!-- Location entries table -->
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Input Timestamp</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="entry in location.entries" :key="getLocationKey(entry)">
                    <TableCell>
                      <div v-if="editingLocationKey === getLocationKey(entry)" class="flex items-center gap-2">
                        <Input
                          v-model.number="editedQuantity"
                          type="number"
                          step="0.01"
                          min="0"
                          class="w-24"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          @click="saveQuantity(entry)"
                          class="h-8 w-8"
                        >
                          <Save class="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          @click="cancelEditing"
                          class="h-8 w-8"
                        >
                          <X class="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      <span v-else>{{ entry.quantity.toFixed(2) }}</span>
                    </TableCell>
                    <TableCell class="text-sm text-gray-600">
                      {{ formatDate(entry.inputTimestamp) }}
                    </TableCell>
                    <TableCell class="text-right">
                      <Button
                        v-if="editingLocationKey !== getLocationKey(entry)"
                        variant="ghost"
                        size="icon"
                        @click="startEditingQuantity(entry)"
                        class="h-8 w-8"
                      >
                        <Pencil class="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Collapsible>
          </div>

          <EmptyState
            v-else
            :icon="Package"
            title="No locations available"
            description="This lot is not stored in any containers."
          />
        </div>
      </Card>
    </div>

    <EmptyState
      v-else
      title="Lot not found"
      description="The requested lot could not be found."
    />

    <!-- Toast Notifications -->
    <Toast :toasts="toasts" />
  </div>
</template>
