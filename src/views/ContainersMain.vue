<script setup lang="ts">
import { ref, onMounted } from 'vue'

const response = ref(null);

onMounted(async () => {
  const res = await fetch('/api/containers/GetAll', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  response.value = await res.json();
  console.log(response.value);
});
</script>

<template>
  <div>Hello from Containers</div>
  <pre>{{ response }}</pre>
</template>
