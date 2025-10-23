<script setup lang="ts">
import type { Container } from '@/models/container';
import { ref } from 'vue';
import { Button as SButton } from '@/components/ui/button'
import ItemCardExtended from './ItemCardExtended.vue';


const targetContainer = ref<Container>({
  name: '',
  properties: []
});


</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Container Details</h2>
    <ItemCardExtended :container="targetContainer" />

    <s-button variant="outline" @click="$emit('addContainer', targetContainer)">
      Add Container
    </s-button>
    <input v-model="targetContainer.name" type="text" placeholder="Container Name" class="border p-2 mb-4 w-full" />
    <s-button variant="outline" @click="targetContainer.properties.push({ name: '', value: '' })">
      Add Property
    </s-button>
    <div v-for="(prop, index) in targetContainer.properties" :key="index" class="mb-2">
      <input v-model="prop.name" type="text" placeholder="Property Name" class="border p-2 mr-2" />
      <input v-model="prop.value" type="text" placeholder="Property Value" class="border p-2" />
      <s-button variant="outline" @click="targetContainer.properties.splice(index, 1)">Remove</s-button>
    </div>
  </div>
</template>
