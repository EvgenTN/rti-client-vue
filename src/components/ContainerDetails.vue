<script setup lang="ts">
import type { Container } from '@/models/container';
import { ref } from 'vue';

const targetContainer = ref<Container>({
  name: '',
  properties: []
});


</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Container Details</h2>
    <button
      class="my-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      @click="$emit('addContainer', targetContainer)"
    >
      Add Container
    </button>
    <input
      v-model="targetContainer.name"
      type="text"
      placeholder="Container Name"
      class="border p-2 mb-4 w-full"
    />
    <button
      class="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      @click="targetContainer.properties.push({ name: '', value: '' })"
    >
      Add Property
    </button>
    <div v-for="(prop, index) in targetContainer.properties" :key="index" class="mb-2">
      <input
        v-model="prop.name"
        type="text"
        placeholder="Property Name"
        class="border p-2 mr-2"
      />
      <input
        v-model="prop.value"
        type="text"
        placeholder="Property Value"
        class="border p-2"
      />
      <button
        class="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        @click="targetContainer.properties.splice(index, 1)"
      >Remove</button>
    </div>
  </div>
</template>
