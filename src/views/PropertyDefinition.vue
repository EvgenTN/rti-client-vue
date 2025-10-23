<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import { PropertyDefinitionService } from '@/lib/property-definition-api'
import type { PropertyDefinition } from '@/models/property-definition'
import { PropertyType } from '@/models/property-definition'

// Reactive data
const propertyDefinitions = ref<PropertyDefinition[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Form data for creating/editing
const showForm = ref(false)
const isEditing = ref(false)
const editingName = ref('')
const propertyName = ref('')
const propertyDesc = ref('')
const propertyType = ref<PropertyType | ''>('')

// Load property definitions
const loadPropertyDefinitions = async () => {
  try {
    loading.value = true
    error.value = null
    propertyDefinitions.value = await PropertyDefinitionService.getAll()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load property definitions'
  } finally {
    loading.value = false
  }
}

// Open create form
const openCreateForm = () => {
  isEditing.value = false
  editingName.value = ''
  propertyName.value = ''
  propertyDesc.value = ''
  propertyType.value = ''
  showForm.value = true
}

// Open edit form
const openEditForm = (propDef: PropertyDefinition) => {
  isEditing.value = true
  editingName.value = propDef.name
  propertyName.value = propDef.name
  propertyDesc.value = propDef.description || ''
  
  // Convert numeric type back to string enum value
  const typeLabels = ['String', 'Double', 'Integer', 'Boolean', 'DateTime', 'Array']
  propertyType.value = (typeLabels[propDef.type] as PropertyType) || ''
  
  showForm.value = true
}

// Save property definition
const savePropertyDefinition = async () => {
  if (!propertyName.value || propertyType.value === '') return

  try {
    // Convert string enum value to number for API
    const typeMapping: Record<string, number> = {
      'String': 0,
      'Double': 1,
      'Integer': 2,
      'Boolean': 3,
      'DateTime': 4,
      'Array': 5
    }

    const data = {
      name: propertyName.value,
      description: propertyDesc.value || undefined,
      type: typeMapping[propertyType.value] ?? 0
    }

    if (isEditing.value) {
      await PropertyDefinitionService.update(editingName.value, data)
    } else {
      await PropertyDefinitionService.create(data)
    }

    await loadPropertyDefinitions()
    showForm.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save property definition'
  }
}

// Delete property definition
const deletePropertyDefinition = async (name: string) => {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return

  try {
    await PropertyDefinitionService.delete(name)
    await loadPropertyDefinitions()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete property definition'
  }
}

// Cancel form
const cancelForm = () => {
  showForm.value = false
}

// Property type options
const propertyTypeOptions = [
  { value: PropertyType.String, label: 'String' },
  { value: PropertyType.Double, label: 'Double' },
  { value: PropertyType.Integer, label: 'Integer' },
  { value: PropertyType.Boolean, label: 'Boolean' },
  { value: PropertyType.DateTime, label: 'DateTime' },
  { value: PropertyType.Array, label: 'Array' }
]

// Convert numeric type to string for display
const getTypeLabel = (type: number): string => {
  const typeLabels = ['String', 'Double', 'Integer', 'Boolean', 'DateTime', 'Array']
  return typeLabels[type] || 'Unknown'
}

// Load data on mount
onMounted(() => {
  loadPropertyDefinitions()
})
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Property Definitions</h1>
      <Button @click="openCreateForm" v-if="!showForm">
        Add Property Definition
      </Button>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="mb-6 p-6 border rounded-lg bg-gray-50">
      <h2 class="text-xl font-semibold mb-4">{{ isEditing ? 'Edit' : 'Create' }} Property Definition</h2>

      <div class="space-y-4">
        <div>
          <Label for="name">Name</Label>
          <Input
            id="name"
            v-model="propertyName"
            placeholder="Property name"
            :disabled="isEditing"
          />
        </div>

        <div>
          <Label for="description">Description (Optional)</Label>
          <Input
            id="description"
            v-model="propertyDesc"
            placeholder="Property description"
          />
        </div>

        <div>
          <Label for="type">Type</Label>
          <Select v-model="propertyType">
            <SelectTrigger>
              <SelectValue placeholder="Select a property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in propertyTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex gap-2">
          <Button @click="savePropertyDefinition" :disabled="!propertyName || propertyType === ''">
            {{ isEditing ? 'Update' : 'Create' }}
          </Button>
          <Button variant="outline" @click="cancelForm">
            Cancel
          </Button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <!-- Property definitions table -->
    <div v-else-if="propertyDefinitions.length > 0" class="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead class="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="propDef in propertyDefinitions" :key="propDef.name">
            <TableCell class="font-medium">{{ propDef.name }}</TableCell>
            <TableCell>{{ propDef.description || '-' }}</TableCell>
            <TableCell>{{ getTypeLabel(propDef.type) }}</TableCell>
            <TableCell>
              <div class="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="openEditForm(propDef)"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  @click="deletePropertyDefinition(propDef.name)"
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <div class="text-gray-500 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No property definitions</h3>
      <p class="text-gray-500 mb-4">Get started by creating your first property definition.</p>
      <Button @click="openCreateForm">
        Add Property Definition
      </Button>
    </div>
  </div>
</template>
