<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ContainerService, type Container } from '@/lib/container-api'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Eye, Plus, Warehouse } from 'lucide-vue-next'
import { useToast } from '@/lib/toast'
import Toast from '@/components/ui/Toast.vue'
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
import ContainerForm from '@/components/containers/ContainerForm.vue'

const router = useRouter()
const containers = ref<Container[]>([])
const loading = ref(false)
const viewMode = ref<'table' | 'cards'>('cards')
const removing = ref<false | string>(false)
const { show } = useToast()
const showConfirm = ref(false)
const confirmPayload = ref<{ name: string } | null>(null)
const showForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editing = ref<Container | undefined>(undefined)

async function loadContainers() {
  loading.value = true
  try {
    containers.value = await ContainerService.getAll()
  } catch (error) {
    show('Failed to load containers', 'error')
  } finally {
    loading.value = false
  }
}

function viewDetails(container: Container) {
  router.push(`/container/${encodeURIComponent(container.name)}/info`)
}

function openCreateForm() {
  formMode.value = 'create'
  editing.value = undefined
  showForm.value = true
}

function openEditForm(container: Container) {
  formMode.value = 'edit'
  editing.value = container
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editing.value = undefined
}

async function saveContainer(payload: any) {
  try {
    if (formMode.value === 'create') {
      await ContainerService.create(payload)
      show('Container created successfully', 'success')
    } else {
      await ContainerService.update(editing.value!.name, payload)
      show('Container updated successfully', 'success')
    }
    await loadContainers()
    closeForm()
  } catch (err: any) {
    show(err?.message || 'Failed to save container', 'error')
  }
}

function promptRemove(container: Container) {
  confirmPayload.value = { name: container.name }
  showConfirm.value = true
}

async function removeContainerConfirmed() {
  if (!confirmPayload.value) return
  const name = confirmPayload.value.name
  removing.value = name
  showConfirm.value = false
  try {
    await ContainerService.delete(name)
    show('Container deleted successfully', 'success')
    await loadContainers()
  } catch (err: any) {
    show(err?.message || 'Failed to remove container', 'error')
  } finally {
    removing.value = false
    confirmPayload.value = null
  }
}

onMounted(() => loadContainers())

const hasContainers = computed(() => (containers.value?.length ?? 0) > 0)
</script>

<template>
  <div>
    <Toast />
    <ConfirmModal
      v-if="showConfirm"
      :title="'Delete container'"
      :message="`Delete container ${confirmPayload?.name}?`"
      @confirm="removeContainerConfirmed"
      @cancel="showConfirm = false"
    />

    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Containers</h1>
      <div class="flex items-center gap-4">
        <ViewSwitcher :current-view="viewMode" @view-change="viewMode = $event" />
        <Button @click="openCreateForm">
          <Plus class="mr-2 h-4 w-4" />
          Create Container
        </Button>
      </div>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="mb-6">
      <ContainerForm
        :model-value="editing"
        :mode="formMode"
        @save="saveContainer"
        @cancel="closeForm"
      />
    </div>

    <!-- Loading State -->
    <LoadingState v-if="loading" message="Loading containers..." />

    <!-- Empty State -->
    <EmptyState
      v-else-if="!hasContainers"
      :icon="Warehouse"
      title="No containers found"
      description="Create your first container to get started."
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
            <TableRow v-for="container in containers" :key="container.name">
              <TableCell class="font-medium">{{ container.name }}</TableCell>
              <TableCell>
                <div v-if="container.properties && container.properties.length > 0" class="flex flex-wrap gap-2">
                  <Badge v-for="p in container.properties" :key="p.name" variant="secondary" class="text-xs">
                    {{ p.name }}: {{ p.value }}
                  </Badge>
                </div>
                <span v-else class="text-sm text-gray-500">No properties defined.</span>
              </TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <Button size="icon" variant="ghost" @click="viewDetails(container)" title="View details">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" @click="openEditForm(container)" title="Edit container">
                    <Pencil class="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" @click="promptRemove(container)" :disabled="removing === container.name" title="Delete container">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Card View -->
      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="container in containers" :key="container.name" class="rounded-lg border bg-white p-4 shadow-sm">
          <div class="mb-4">
            <h3 class="text-lg font-semibold">{{ container.name }}</h3>
          </div>

          <div class="mb-4">
            <div v-if="container.properties && container.properties.length > 0">
              <h4 class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Properties:</h4>
              <div class="flex flex-wrap gap-2">
                <Badge v-for="p in container.properties" :key="p.name" variant="secondary" class="text-xs">
                  {{ p.name }}: {{ p.value }}
                </Badge>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">No properties defined.</p>
          </div>

          <div class="flex gap-2 pt-4">
            <Button variant="outline" size="sm" @click="viewDetails(container)">
              <Eye class="mr-2 h-4 w-4" />
              Details
            </Button>
            <Button size="sm" @click="openEditForm(container)">
              <Pencil class="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" @click="promptRemove(container)" :disabled="removing === container.name">
              <Trash2 class="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
