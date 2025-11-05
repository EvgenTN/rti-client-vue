<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LotService } from '@/lib/lot-api'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-vue-next'
import { useToast } from '@/lib/toast'
import Toast from '@/components/ui/Toast.vue'
import LotForm from '@/components/lots/LotForm.vue'

const router = useRouter()
const { show } = useToast()

function goBack() {
  router.push('/lots')
}

async function saveLot(payload: any) {
  try {
    await LotService.create(payload)
    show('Lot created successfully', 'success')
    router.push('/lots')
  } catch (err: any) {
    show(err?.message || 'Failed to create lot', 'error')
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-6">
    <Toast />

    <div class="mb-6">
      <Button variant="secondary" @click="goBack">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to lots
      </Button>
    </div>

    <LotForm mode="create" @save="saveLot" @cancel="goBack" />
  </div>
</template>
