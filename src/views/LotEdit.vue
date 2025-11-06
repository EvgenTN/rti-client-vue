<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LotService } from '@/lib/lot-api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2 } from 'lucide-vue-next'
import { useToast } from '@/lib/toast'
import Toast from '@/components/ui/Toast.vue'
import LotForm from '@/components/lots/LotForm.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const { show } = useToast()
const loading = ref(false)
const lot = ref<any>(null)
const showDeleteConfirm = ref(false)
const deleting = ref(false)

const lotName = computed(() => route.params.name as string)

async function loadLot() {
  loading.value = true
  try {
    lot.value = await LotService.getOne(lotName.value)
  } catch (error) {
    show('Failed to load lot', 'error')
    router.push('/lots')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/lots')
}

async function saveLot(payload: any) {
  try {
    await LotService.update(lotName.value, payload)
    show('Lot updated successfully', 'success')
    router.push('/lots')
  } catch (err: any) {
    show(err?.message || 'Failed to update lot', 'error')
  }
}

function promptDelete() {
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  showDeleteConfirm.value = false
  deleting.value = true
  try {
    await LotService.remove(lotName.value)
    show('Lot deleted successfully', 'success')
    router.push('/lots')
  } catch (err: any) {
    show(err?.message || 'Failed to delete lot', 'error')
  } finally {
    deleting.value = false
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
}

onMounted(() => {
  loadLot()
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-6">
    <Toast />
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="Delete Lot"
      :message="`Are you sure you want to delete lot '${lotName}'? This action cannot be undone.`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <div class="mb-6 flex items-center justify-between">
      <Button variant="secondary" @click="goBack">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to lots
      </Button>
      <Button
        variant="destructive"
        size="icon"
        @click="promptDelete"
        :disabled="deleting || loading"
        title="Delete lot"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>

    <LoadingState v-if="loading" message="Loading lot..." />
    <LotForm v-else-if="lot" :model-value="lot" mode="edit" @save="saveLot" @cancel="goBack" />
  </div>
</template>
