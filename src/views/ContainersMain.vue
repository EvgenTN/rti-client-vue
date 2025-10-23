<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ItemCard from '@/components/ItemCard.vue';
import type { Response } from '@/models/container';
import { Button as SButton } from '@/components/ui/button'

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

onMounted(async () => {
  fetchContainers();

  console.log(response.value);
});
</script>

<template>
  <div class="mb-4">Hello from Containers</div>
  <SButton class="mb-2 cursor-pointer" size="lg">Add Container</SButton>
  <div class="grid grid-cols-3 gap-4 mb-4">
    <item-card v-for="item in response.items" :key="item.name" :container="item" />
  </div>
  <hr />
  <div class="mt-4">{{ response }}</div>
</template>
