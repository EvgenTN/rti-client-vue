<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { LotService, type Lot } from '@/lib/lot-api'
import { Button as SButton } from '@/components/ui/button'
import { Pencil, Trash2, Eye, Plus, Package } from 'lucide-vue-next'
import Toast from '@/components/ui/Toast.vue'
import { useToast } from '@/lib/toast'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import ViewSwitcher from '@/components/ui/ViewSwitcher.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingState from '@/components/ui/LoadingState.vue'

const router = useRouter()
const authStore = useAuthStore()
const lots = ref<Lot[]>([])
const loading = ref(false)
const viewMode = ref<'table' | 'cards'>('cards')
const removing = ref<false | string>(false)
const { show } = useToast()
const showConfirm = ref(false)
const confirmPayload = ref<{ name: string } | null>(null)

async function loadLots() {
  loading.value = true
  try {
    lots.value = await LotService.getAll()
  } finally {
    loading.value = false
  }
}

function createLot() {
  router.push('/lots/create')
}

function editLot(lot: Lot) {
  router.push(`/lots/${encodeURIComponent(lot.name)}/edit`)
}

function promptRemove(lot: Lot) {
  confirmPayload.value = { name: lot.name }
  showConfirm.value = true
}

function viewDetails(lot: Lot) {
  router.push(`/lots/${encodeURIComponent(lot.name)}`)
}

async function removeLotConfirmed() {
  if (!confirmPayload.value) return
  const name = confirmPayload.value.name
  removing.value = name
  showConfirm.value = false
  try {
    await LotService.remove(name)
    show('Lot removed', 'success')
    await loadLots()
  } catch (err: any) {
    show(err?.message || 'Failed to remove', 'error')
  } finally {
    removing.value = false
    confirmPayload.value = null
  }
}

onMounted(() => loadLots())

const hasLots = computed(() => (lots.value?.length ?? 0) > 0)
</script>

<template>
  <div>
    <Toast />
    <ConfirmModal 
      v-if="showConfirm" 
      :title="'Delete lot'" 
      :message="`Delete lot ${confirmPayload?.name}?`" 
      @confirm="removeLotConfirmed" 
      @cancel="showConfirm = false" 
    />
    
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Lots</h1>
      <div class="flex items-center gap-4">
        <ViewSwitcher :current-view="viewMode" @view-change="viewMode = $event" />
        <SButton v-if="authStore.isOperator" @click="createLot">
          <Plus class="mr-2 h-4 w-4" />
          Create Lot
        </SButton>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingState v-if="loading" message="Loading lots..." />

    <!-- Empty State -->
    <EmptyState
      v-else-if="!hasLots"
      :icon="Package"
      title="No lots found"
      description="Create your first lot to get started."
    />

    <!-- Content -->
    <div v-else>
      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Properties</TableHead>
              <TableHead class="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="lot in lots" :key="lot.name">
              <TableCell class="font-medium">{{ lot.name }}</TableCell>
              <TableCell>
                <div v-if="lot.properties.length > 0" class="flex flex-wrap gap-2">
                  <Badge v-for="p in lot.properties" :key="p.name" variant="secondary" class="text-xs">
                    {{ p.name }}: {{ p.value }}
                  </Badge>
                </div>
                <span v-else class="text-sm text-gray-500">No properties defined.</span>
              </TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <SButton size="icon" variant="ghost" @click="viewDetails(lot)" title="View details">
                    <Eye class="h-4 w-4" />
                  </SButton>
                  <SButton v-if="authStore.isOperator" size="icon" variant="ghost" @click="editLot(lot)" title="Edit lot">
                    <Pencil class="h-4 w-4" />
                  </SButton>
                  <SButton v-if="authStore.isOperator" size="icon" variant="ghost" @click="promptRemove(lot)" :disabled="removing === lot.name" title="Delete lot">
                    <Trash2 class="h-4 w-4" />
                  </SButton>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Card View -->
      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="lot in lots" :key="lot.name" class="rounded-lg border bg-white p-4 shadow-sm">
          <div class="mb-4">
            <h3 class="text-lg font-semibold">{{ lot.name }}</h3>
          </div>

          <div class="mb-4">
            <div v-if="lot.properties.length > 0">
              <h4 class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Properties:</h4>
              <div class="flex flex-wrap gap-2">
                <Badge v-for="p in lot.properties" :key="p.name" variant="secondary" class="text-xs">
                  {{ p.name }}: {{ p.value }}
                </Badge>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">No properties defined.</p>
          </div>

          <div class="flex gap-2 pt-4">
            <SButton variant="outline" size="sm" @click="viewDetails(lot)">
              <Eye class="mr-2 h-4 w-4" />
              Details
            </SButton>
            <SButton v-if="authStore.isOperator" size="sm" @click="editLot(lot)">
              <Pencil class="mr-2 h-4 w-4" />
              Edit
            </SButton>
            <SButton v-if="authStore.isOperator" variant="destructive" size="sm" @click="promptRemove(lot)" :disabled="removing === lot.name">
              <Trash2 class="mr-2 h-4 w-4" />
              Delete
            </SButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
