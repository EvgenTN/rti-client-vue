<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ItemCard from '@/components/ItemCard.vue';
import type { Response } from '@/models/container';
import { Button as SButton } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const response = ref<Response>( { items: [] } );


async function fetchContainers() {
  // Logic to fetch containers from the backend
  const res = await fetch('/api/containers/GetAll', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  response.value = await res.json() as Response;
}


// form state for creating container
const showForm = ref(false)
const containerName = ref('')
const creating = ref(false)

function openAddForm() {
  containerName.value = ''
  showForm.value = true
}

function cancelAddForm() {
  showForm.value = false
}

async function addContainer() {
  if (!containerName.value || !containerName.value.trim()) return
  const dto = { name: containerName.value.trim(), properties: [] }
  creating.value = true
  try {
    const r = await fetch('/api/containers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })

    if (r.status === 201) {
      await fetchContainers()
      showForm.value = false
    } else {
      const text = await r.text()
      window.alert('Failed to create container: ' + (text || r.statusText))
    }
  } catch (err: any) {
    window.alert('Network error creating container: ' + String(err))
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  fetchContainers();

  console.log(response.value);
});
</script>

<template>
  <div class="mb-4">Hello from Containers</div>
  <SButton @click="openAddForm" class="mb-2 cursor-pointer" size="lg">Add Container</SButton>
  <div v-if="showForm" class="mb-4 p-4 border rounded-lg bg-gray-50 max-w-md">
    <h3 class="text-lg font-medium mb-2">Create container</h3>
    <div class="space-y-3">
      <div>
        <Label for="container-name">Name</Label>
        <Input id="container-name" v-model="containerName" placeholder="Container name" />
      </div>
      <div class="flex gap-2">
        <SButton @click="addContainer" :disabled="creating || !containerName.trim()">Create</SButton>
        <SButton variant="outline" @click="cancelAddForm">Cancel</SButton>
      </div>
    </div>
  </div>
  <div class="grid grid-cols-3 gap-4 mb-4">
    <item-card v-for="item in response.items" :key="item.name" :container="item" />
  </div>
  <hr />
  <div class="mt-4">{{ response }}</div>
</template>
