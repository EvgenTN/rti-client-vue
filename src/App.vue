<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/containers">Containers</RouterLink>
    <RouterLink to="/property-definition">Property definition</RouterLink>
  </nav>

  <RouterView />
</template>

<style scoped></style>
