<script setup lang="ts">
import { ref, watch, toRef, onMounted } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyDefinitionService } from '@/lib/property-definition-api'
import { ContainerService, type Container } from '@/lib/container-api'


const emit = defineEmits<{
  (e: 'save', payload: any): void
  (e: 'cancel'): void
}>()

const props = withDefaults(defineProps<{ modelValue?: any; mode: 'create' | 'edit' }>(), { modelValue: undefined })
const mode = toRef(props, 'mode')

const name = ref(props.modelValue?.name ?? '')
const containerName = ref(props.modelValue?.containerName ?? '')
const quantity = ref<number | ''>(props.modelValue?.quantity ?? '')
const properties = ref<Array<{ name: string; value: string }>>(props.modelValue?.properties ?? [])
const propertyDefs = ref<Array<{ name: string }>>([])
const loadingPropertyDefs = ref(false)
const propertyDefsError = ref<string | null>(null)
const containers = ref<Container[]>([])
const loadingContainers = ref(false)
const containersError = ref<string | null>(null)

async function loadPropertyDefs() {
  if (loadingPropertyDefs.value) return
  
  loadingPropertyDefs.value = true
  propertyDefsError.value = null
  
  try {
    const defs = await PropertyDefinitionService.getAll()
    propertyDefs.value = defs.map(d => ({ name: d.name }))
  } catch (e) {
    propertyDefsError.value = 'Failed to load property definitions'
    console.error('Failed to load property definitions:', e)
  } finally {
    loadingPropertyDefs.value = false
  }
}

async function loadContainers() {
  if (loadingContainers.value) return
  
  loadingContainers.value = true
  containersError.value = null
  
  try {
    const data = await ContainerService.getAll()
    containers.value = data
  } catch (e) {
    containersError.value = 'Failed to load containers'
    console.error('Failed to load containers:', e)
  } finally {
    loadingContainers.value = false
  }
}

onMounted(() => {
  loadPropertyDefs()
  if (mode.value === 'create') {
    loadContainers()
  }
})

watch(() => props.modelValue, (v) => {
  name.value = v?.name ?? ''
  containerName.value = v?.containerName ?? ''
  quantity.value = v?.quantity ?? ''
  properties.value = v?.properties ? v.properties.map((p: any) => ({ name: p.name, value: p.value })) : []
})

function addProperty() {
  properties.value.push({ name: '', value: '' })
}

function removeProperty(idx: number) {
  properties.value.splice(idx, 1)
}

function onSave() {
  if (!name.value || !name.value.trim()) return
  if (mode.value === 'create' && (!containerName.value || !String(containerName.value).trim())) return
  const payload: any = { name: name.value.trim(), properties: properties.value.map(p => ({ name: p.name, value: p.value })) }
  if (mode.value === 'create') payload.containerName = containerName.value.trim()
  if (mode.value === 'create') payload.quantity = Number(quantity.value)
  emit('save', payload)
}

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="p-4 border rounded-md bg-white max-w-lg">
    <div class="mb-3">
      <Label for="lot-name">Name</Label>
      <Input id="lot-name" v-model="name" placeholder="Lot name" />
    </div>

    <div v-if="mode === 'create'" class="mb-3">
      <Label for="container-name">Container</Label>
      <Select v-model="containerName" :disabled="loadingContainers">
        <SelectTrigger>
          <SelectValue :placeholder="loadingContainers ? 'Loading...' : containersError ? 'Error loading containers' : 'Select container'" />
        </SelectTrigger>
        <SelectContent>
          <template v-if="containers.length === 0 && !loadingContainers && !containersError">
            <SelectItem value="__no_containers__" disabled>No containers available</SelectItem>
          </template>
          <template v-else>
            <SelectItem v-for="container in containers" :key="container.name" :value="container.name">
              {{ container.name }}
            </SelectItem>
          </template>
        </SelectContent>
      </Select>
    </div>

    <div v-if="mode === 'create'" class="mb-3">
      <Label for="quantity">Quantity</Label>
      <Input id="quantity" v-model="quantity" placeholder="Quantity" />
    </div>

    <div class="mb-3">
      <Label>Properties</Label>
      <div class="space-y-2 mt-2">
        <div v-for="(p, idx) in properties" :key="idx" class="flex gap-2 items-center">
          <div class="flex-1">
            <Select v-model="p.name" :disabled="loadingPropertyDefs">
              <SelectTrigger>
                <SelectValue :placeholder="loadingPropertyDefs ? 'Loading...' : propertyDefsError ? 'Error loading properties' : 'Select property'" />
              </SelectTrigger>
              <SelectContent>
                <template v-if="propertyDefs.length === 0 && !loadingPropertyDefs && !propertyDefsError">
                  <SelectItem value="__no_properties__" disabled>No property definitions available</SelectItem>
                </template>
                <template v-else>
                  <SelectItem v-for="opt in propertyDefs" :key="opt.name" :value="opt.name">{{ opt.name }}</SelectItem>
                </template>
              </SelectContent>
            </Select>
          </div>
          <Input v-model="p.value" placeholder="Value" class="flex-1" />
          <Button variant="outline" size="sm" @click.prevent="removeProperty(idx)">Remove</Button>
        </div>
        <Button variant="ghost" @click.prevent="addProperty">+ Add property</Button>
      </div>
    </div>

    <div class="flex gap-2 mt-2">
      <Button @click="onSave">{{ mode === 'create' ? 'Create' : 'Save' }}</Button>
      <Button variant="outline" @click="onCancel">Cancel</Button>
    </div>
  </div>
</template>
