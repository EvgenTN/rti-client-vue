<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LotService } from '@/lib/lot-api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, Info, Package } from 'lucide-vue-next'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Card from '@/components/ui/Card.vue'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const lot = ref<any>(null)

const lotName = computed(() => route.params.name as string)

async function loadLotDetails() {
  loading.value = true
  try {
    // TODO: Replace with actual details API call when backend is ready
    const lotData = await LotService.getOne(lotName.value)
    lot.value = {
      ...lotData,
      locations: [] // Will be populated when backend endpoint is ready
    }
  } catch (error) {
    console.error('Failed to load lot details:', error)
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
          <EmptyState
            :icon="Package"
            title="No locations available"
            description="Location tracking will be available when the backend endpoint is implemented."
          />
        </div>
      </Card>
    </div>

    <EmptyState
      v-else
      title="Lot not found"
      description="The requested lot could not be found."
    />
  </div>
</template>
