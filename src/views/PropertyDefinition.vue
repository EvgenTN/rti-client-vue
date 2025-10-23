<script setup lang="ts">
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
// import { ref } from 'vue';


</script>

<template>
  <h2 class="mb-4 text-lg">Property Definition Component</h2>

  <div class="mb-4">
    <Label class="mb-2 block">Define New Property</Label>
    <Input placeholder="Property Name" v-model="propertyName" />
  </div>

  <div class="mb-4">
    <Label class="mb-2 block">Define New Property Description</Label>
    <Input placeholder="Property Description" v-model="propertyDesc" />
  </div>

  <div class="mb-4">
    <Label class="mb-2 block">Define New Property Type</Label>
    <Select v-model="propertyType">
      <SelectTrigger class="w-full">
        <SelectValue placeholder="Select a property type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="string">String</SelectItem>
        <SelectItem value="number">Number</SelectItem>
        <SelectItem value="boolean">Boolean</SelectItem>
        <SelectItem value="date">Date</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <Button variant="outline">Add Property Definition</Button>

</template>
