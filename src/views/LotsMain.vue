<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { LotService, type Lot } from '@/lib/lot-api'
import { Button as SButton } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-vue-next'
import Toast from '@/components/ui/Toast.vue'
import { useToast } from '@/lib/toast'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import LotForm from '@/components/lots/LotForm.vue'

const lots = ref<Lot[]>([])
const loading = ref(false)
const viewMode = ref<'table'|'cards'>('table')

const showForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editing = ref<Lot|undefined>(undefined)
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

function openCreate() {
  formMode.value = 'create'
  editing.value = undefined
  showForm.value = true
}

function openEdit(lot: Lot) {
  formMode.value = 'edit'
  editing.value = lot
  showForm.value = true
}

function promptRemove(lot: Lot) {
  confirmPayload.value = { name: lot.name }
  showConfirm.value = true
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

async function onSave(payload: any) {
  try {
    if (formMode.value === 'create') {
      await LotService.create(payload)
    } else if (formMode.value === 'edit' && editing.value) {
      await LotService.update(editing.value.name, payload)
    }
    showForm.value = false
    await loadLots()
  } catch (err: any) {
    alert(err?.message || 'Failed to save')
  }
}

onMounted(() => loadLots())

const hasLots = computed(() => (lots.value?.length ?? 0) > 0)
</script>

<template>
  <div class="p-6">
    <Toast />
    <ConfirmModal v-if="showConfirm" :title="'Delete lot'" :message="`Delete lot ${confirmPayload?.name}?`" @confirm="removeLotConfirmed" @cancel="showConfirm = false" />
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Lots</h1>
      <div class="flex items-center gap-2">
          <SButton @click="openCreate">Create Lot</SButton>
          <SButton @click="viewMode = viewMode === 'table' ? 'cards' : 'table'">Toggle View</SButton>
        </div>
    </div>

    <div v-if="showForm" class="mb-4">
      <LotForm :mode="formMode" :modelValue="editing" @save="onSave" @cancel="showForm = false" />
    </div>

    <div v-if="loading" class="py-8 text-center">Loading...</div>

    <div v-else>
      <div v-if="viewMode === 'table'">
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
                <div class="flex flex-wrap gap-2">
                  <span v-for="p in lot.properties" :key="p.name" class="px-2 py-1 text-sm bg-gray-100 rounded">{{ p.name }}: {{ p.value }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <SButton size="icon" variant="ghost" @click="openEdit(lot)" title="Edit lot">
                    <Pencil class="h-4 w-4" />
                  </SButton>
                  <SButton size="icon" variant="ghost" @click="promptRemove(lot)" :disabled="removing === lot.name" title="Delete lot">
                    <Trash2 class="h-4 w-4" />
                  </SButton>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div v-else>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="lot in lots" :key="lot.name" class="border rounded p-4 bg-white">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">{{ lot.name }}</h3>
                <div class="text-sm text-gray-600 mt-2">
                  <div v-for="p in lot.properties" :key="p.name">{{ p.name }}: {{ p.value }}</div>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <SButton size="icon" variant="ghost" @click="openEdit(lot)" title="Edit lot">
                  <Pencil class="h-4 w-4" />
                </SButton>
                <SButton size="icon" variant="ghost" @click="promptRemove(lot)" :disabled="removing === lot.name" title="Delete lot">
                  <Trash2 class="h-4 w-4" />
                </SButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!hasLots" class="text-center py-8 text-gray-500">No lots yet</div>
    </div>
  </div>
</template>
