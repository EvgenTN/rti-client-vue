import type { PropertyDefinition, PropertyType } from '@/models/property-definition'

const API_BASE = '/api'

export class PropertyDefinitionService {
  static async getAll(): Promise<PropertyDefinition[]> {
    const response = await fetch(`${API_BASE}/property-definitions`)
    if (!response.ok) {
      throw new Error('Failed to fetch property definitions')
    }
    return response.json()
  }

  static async getOne(name: string): Promise<PropertyDefinition> {
    const response = await fetch(`${API_BASE}/property-definitions/${name}`)
    if (!response.ok) {
      throw new Error('Failed to fetch property definition')
    }
    return response.json()
  }

  static async create(data: {
    name: string
    description?: string
    type: number
  }): Promise<PropertyDefinition> {
    const response = await fetch(`${API_BASE}/property-definitions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create property definition')
    }
    return response.json()
  }

  static async update(name: string, data: {
    name: string
    description?: string
    type: number
  }): Promise<PropertyDefinition> {
    const response = await fetch(`${API_BASE}/property-definitions/${name}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update property definition')
    }
    return response.json()
  }

  static async delete(name: string): Promise<void> {
    const response = await fetch(`${API_BASE}/property-definitions/${name}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete property definition')
    }
  }
}