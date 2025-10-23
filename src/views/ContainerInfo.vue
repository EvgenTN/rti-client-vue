<script setup lang="ts">
import ContainerDetails from '@/components/ContainerDetails.vue';
import type { Container } from '@/models/container';

async function addContainer(targetContainer : Container) {
  // Logic to add a new container
  await fetch('/api/containers', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(targetContainer)
  });
  // fetchContainers();
  alert(JSON.stringify(targetContainer));
}

// async function fetchContainers() {
//   // Logic to fetch containers from the backend
//   const res = await fetch('/api/containers/GetAll', {
//     method: 'post',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({})
//   });
//   response.value = await res.json() as Response;
// }
</script>

<template>
  <ContainerDetails @add-container="addContainer" />
</template>
