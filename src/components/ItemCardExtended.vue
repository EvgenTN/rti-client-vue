<script setup lang="ts">
import type { Container } from '@/models/container';
import { useRouter } from 'vue-router';

const props = defineProps<{ container: Container }>();
const router = useRouter();

function goToContainerInfo() {
  // navigate to named nested route: container-info
  router.push({ name: 'container-info', params: { name: props.container.name } });
}
</script>

<template>
  <div>
    <a
      href="#"
      @click.prevent="goToContainerInfo"
      class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {{ container.name }}
      </h5>
      <p class="font-normal text-gray-700 dark:text-gray-400" v-for="value in container.properties" :key="value.name">
        {{ value.name }}: {{ value.value }}
      </p>
    </a>
  </div>
</template>
