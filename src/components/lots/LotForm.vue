<script setup lang="ts">
import { ref, watch, toRef, onMounted, computed } from 'vue'
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

const isFormValid = computed(() => {
  if (!name.value?.trim()) return false
  if (mode.value === 'create') {
    if (!containerName.value?.trim()) return false
    if (!quantity.value || Number(quantity.value) < 0) return false
  }
  // Check if all properties have both name and value
  for (const prop of properties.value) {
    if (!prop.name?.trim() || !prop.value?.trim()) return false
  }
  return true
})

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
  <div class="rounded-lg border bg-white shadow-sm">
    <div class="border-b bg-gray-50 p-6">
      <h2 class="text-xl font-semibold text-gray-900">
        {{ mode === 'create' ? 'Create Lot' : 'Edit Lot' }}
      </h2>
      <p class="mt-1 text-sm text-gray-600">
        {{
          mode === 'create'
            ? 'Provide details for the new lot.'
            : "Update this lot's name and properties."
        }}
      </p>
    </div>

    <div class="p-6">
      <form @submit.prevent="onSave" class="space-y-6">
        <!-- Basic Information Section -->
        <div class="grid gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <Label for="lot-name"
              >Name <span class="text-red-500">*</span></Label
            >
            <Input
              id="lot-name"
              v-model="name"
              placeholder="Enter lot name"
              required
              class="mt-1"
            />
          </div>
        </div>

        <!-- Container and Quantity (Create only) -->
        <div v-if="mode === 'create'" class="grid gap-4 md:grid-cols-2">
          <div>
            <Label for="container-name"
              >Container <span class="text-red-500">*</span></Label
            >
            <Select v-model="containerName" :disabled="loadingContainers" required>
              <SelectTrigger class="mt-1">
                <SelectValue
                  :placeholder="
                    loadingContainers
                      ? 'Loading...'
                      : containersError
                        ? 'Error loading containers'
                        : 'Select container'
                  "
                />
              </SelectTrigger>
              <SelectContent>
                <template
                  v-if="containers.length === 0 && !loadingContainers && !containersError"
                >
                  <SelectItem value="__no_containers__" disabled
                    >No containers available</SelectItem
                  >
                </template>
                <template v-else>
                  <SelectItem
                    v-for="container in containers"
                    :key="container.name"
                    :value="container.name"
                  >
                    {{ container.name }}
                  </SelectItem>
                </template>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="quantity"
              >Quantity <span class="text-red-500">*</span></Label
            >
            <Input
              id="quantity"
              v-model="quantity"
              type="number"
              placeholder="Enter quantity"
              min="0"
              required
              class="mt-1"
            />
          </div>
        </div>

        <!-- Properties Section -->
        <div class="border-t border-gray-200 pt-6">
          <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Properties</h3>
            <Button type="button" variant="secondary" @click.prevent="addProperty">
              <span class="material-icons mr-2 text-sm">add</span>
              Add Property
            </Button>
          </div>

          <div class="flex flex-col gap-4">
            <p v-if="properties.length === 0" class="text-sm text-gray-500">
              No properties added yet. Use "Add Property" to define attributes.
            </p>

            <div
              v-for="(p, idx) in properties"
              :key="idx"
              class="flex flex-col gap-4 rounded-md border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-start md:gap-3"
            >
              <div class="md:flex-1">
                <Label :for="`property-name-${idx}`"
                  >Property Name <span class="text-red-500">*</span></Label
                >
                <Select v-model="p.name" :disabled="loadingPropertyDefs" required>
                  <SelectTrigger :id="`property-name-${idx}`" class="mt-1">
                    <SelectValue
                      :placeholder="
                        loadingPropertyDefs
                          ? 'Loading...'
                          : propertyDefsError
                            ? 'Error loading properties'
                            : 'Select property'
                      "
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <template
                      v-if="
                        propertyDefs.length === 0 && !loadingPropertyDefs && !propertyDefsError
                      "
                    >
                      <SelectItem value="__no_properties__" disabled
                        >No property definitions available</SelectItem
                      >
                    </template>
                    <template v-else>
                      <SelectItem v-for="opt in propertyDefs" :key="opt.name" :value="opt.name">
                        {{ opt.name }}
                      </SelectItem>
                    </template>
                  </SelectContent>
                </Select>
              </div>

              <div class="md:flex-1">
                <Label :for="`property-value-${idx}`"
                  >Property Value <span class="text-red-500">*</span></Label
                >
                <Input
                  :id="`property-value-${idx}`"
                  v-model="p.value"
                  placeholder="Enter value"
                  required
                  class="mt-1"
                />
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                class="self-start md:mt-7"
                @click.prevent="removeProperty(idx)"
                title="Remove property"
              >
                <span class="material-icons text-sm">delete</span>
              </Button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div
          class="flex flex-col-reverse gap-4 border-t border-gray-200 pt-6 md:flex-row md:justify-end"
        >
          <Button type="button" variant="outline" @click="onCancel"> Cancel </Button>
          <Button type="submit" :disabled="!isFormValid">
            {{ mode === 'create' ? 'Create Lot' : 'Update Lot' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
