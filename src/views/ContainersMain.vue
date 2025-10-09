<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ItemCard from '@/components/ItemCard.vue';
import ContainerDetails from '@/components/ContainerDetails.vue';
import type { Container, Response } from '@/models/container';

const response = ref<Response>( { items: [] } );

async function addContainer(targetContainer : Container) {
  // Logic to add a new container
  await fetch('/api/containers', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(targetContainer)
  });
  fetchContainers();
  alert(JSON.stringify(targetContainer));
}

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
  <item-card v-for="item in response.items" :key="item.name" :container="item" />
  <hr />
  <container-details @add-container="addContainer" />
  <div class="mt-4">{{ response }}</div>
</template>
