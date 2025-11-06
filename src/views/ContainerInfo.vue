<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ContainerService, type ContainerWithLots, type ContainerLot } from '@/lib/container-api'
import { ActionService } from '@/lib/action-api'
import { useToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Pencil, Info, Warehouse, Eye, Edit, Check, X } from 'lucide-vue-next'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Card from '@/components/ui/Card.vue'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import Collapsible from '@/components/ui/Collapsible.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const container = ref<ContainerWithLots | null>(null)
const editingLotKey = ref<string | null>(null)
const editedQuantity = ref<number>(0)

const containerName = computed(() => route.params.name as string)

interface AggregatedLot {
  name: string
  totalQuantity: number
  entries: ContainerLot[]
}

const aggregatedLots = computed<AggregatedLot[]>(() => {
  if (!container.value) return []

  const lotsMap = new Map<string, AggregatedLot>()
  
  container.value.lots.forEach(lot => {
    if (!lotsMap.has(lot.name)) {
      lotsMap.set(lot.name, {
        name: lot.name,
        totalQuantity: 0,
        entries: []
      })
    }
    const aggregated = lotsMap.get(lot.name)!
    aggregated.totalQuantity += lot.quantity
    aggregated.entries.push(lot)
  })

  return Array.from(lotsMap.values())
})

function getLotKey(lot: ContainerLot): string {
  return `${lot.name}|${lot.inputTimestamp}`
}

async function loadContainerDetails() {
  loading.value = true
  try {
    container.value = await ContainerService.getContainerWithLots(containerName.value)
  } catch (error) {
    console.error('Failed to load container details:', error)
    toast.show('Failed to load container details', 'error')
    router.push('/containers')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/containers')
}

function editContainer() {
  // TODO: Implement edit navigation
  console.log('Edit container:', containerName.value)
}

function viewLotDetails(lotName: string) {
  router.push(`/lots/${lotName}`)
}

function startEditingQuantity(lot: ContainerLot) {
  editingLotKey.value = getLotKey(lot)
  editedQuantity.value = lot.quantity
}

function cancelEditing() {
  editingLotKey.value = null
  editedQuantity.value = 0
}

async function saveQuantity(lot: ContainerLot) {
  if (editedQuantity.value < 0) {
    toast.show('Quantity cannot be negative', 'error')
    return
  }

  try {
    await ActionService.updateLotQuantity({
      lotName: lot.name,
      containerName: containerName.value,
      quantity: editedQuantity.value
    })

    // Update local state
    if (container.value) {
      const lotEntry = container.value.lots.find(l => getLotKey(l) === getLotKey(lot))
      if (lotEntry) {
        lotEntry.quantity = editedQuantity.value
      }
    }

    editingLotKey.value = null
    toast.show('Quantity updated successfully', 'success')
  } catch (error) {
    console.error('Failed to update quantity:', error)
    toast.show('Failed to update quantity', 'error')
    cancelEditing()
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  loadContainerDetails()
})

</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Container Details</h1>
        <p v-if="container" class="text-gray-600">
          Details for container: <span class="font-semibold">{{ container.name }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="goBack">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to Containers
        </Button>
        <Button v-if="container" @click="editContainer">
          <Pencil class="mr-2 h-4 w-4" />
          Edit Container
        </Button>
      </div>
    </div>

    <LoadingState v-if="loading" message="Loading container details..." />

    <div v-else-if="container" class="grid gap-6 lg:grid-cols-2">
      <!-- Properties Card -->
      <Card>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">Properties</h2>
          <div v-if="container.properties && container.properties.length > 0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="prop in container.properties" :key="prop.name">
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
            description="This container has no properties assigned."
          />
        </div>
      </Card>

      <!-- Lots Card -->
      <Card>
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold">Lots</h2>
          <div v-if="aggregatedLots.length > 0" class="space-y-2">
            <Collapsible v-for="lot in aggregatedLots" :key="lot.name">
              <template #header>
                <div class="flex items-center gap-4 flex-1">
                  <div class="flex items-center gap-2 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click.stop="viewLotDetails(lot.name)"
                      class="h-8 w-8 p-0"
                    >
                      <Eye class="h-4 w-4" />
                    </Button>
                    <span class="font-medium">{{ lot.name }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <span class="text-sm">Total:</span>
                    <span class="font-semibold">{{ lot.totalQuantity.toFixed(2) }}</span>
                  </div>
                </div>
              </template>

              <!-- Detailed entries inside collapsible -->
              <div class="pt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Input Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="entry in lot.entries" :key="getLotKey(entry)">
                      <TableCell>
                        <div v-if="editingLotKey === getLotKey(entry)" class="flex items-center gap-2">
                          <Input
                            v-model.number="editedQuantity"
                            type="number"
                            min="0"
                            step="0.1"
                            class="w-24"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="saveQuantity(entry)"
                            class="h-8 w-8 p-0"
                          >
                            <Check class="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="cancelEditing"
                            class="h-8 w-8 p-0"
                          >
                            <X class="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        <span v-else>{{ entry.quantity.toFixed(2) }}</span>
                      </TableCell>
                      <TableCell class="text-sm text-gray-600">
                        {{ formatDate(entry.inputTimestamp) }}
                      </TableCell>
                      <TableCell>
                        <Button
                          v-if="editingLotKey !== getLotKey(entry)"
                          variant="ghost"
                          size="sm"
                          @click="startEditingQuantity(entry)"
                          class="h-8 w-8 p-0"
                        >
                          <Edit class="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Collapsible>
          </div>
          <EmptyState
            v-else
            :icon="Warehouse"
            title="No lots available"
            description="This container has no lots."
          />
        </div>
      </Card>
    </div>

    <EmptyState
      v-else
      title="Container not found"
      description="The requested container could not be found."
    />
  </div>
</template>
