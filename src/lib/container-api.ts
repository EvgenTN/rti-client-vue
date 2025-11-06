const API_BASE = '/api'

export interface Container {
  name: string
  properties?: Array<{ name: string; value: string }>
}

export interface ContainerLot {
  name: string
  quantity: number
  inputTimestamp: string
}

export interface ContainerWithLots extends Container {
  lots: ContainerLot[]
}

interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  hasNextPage: boolean
}

export class ContainerService {
  static async getAll(): Promise<Container[]> {
    try {
      const response = await fetch(`${API_BASE}/containers/GetAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          pageSize: 100
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Container API error response:', response.status, errorText)
        throw new Error(`Failed to fetch containers: ${response.status} - ${errorText}`)
      }
      
      const data: PagedResponse<Container> = await response.json()
      console.log('Container API response:', data)
      return data.items || []
    } catch (error) {
      console.error('Container API fetch error:', error)
      throw error
    }
  }

  static async getOne(name: string): Promise<Container> {
    const response = await fetch(`${API_BASE}/containers/${encodeURIComponent(name)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch container')
    }
    return response.json()
  }

  static async getContainerWithLots(name: string): Promise<ContainerWithLots> {
    const response = await fetch(`${API_BASE}/containers/${encodeURIComponent(name)}/lots`)
    if (!response.ok) {
      throw new Error('Failed to fetch container with lots')
    }
    return response.json()
  }

  static async create(container: Container): Promise<Container> {
    const response = await fetch(`${API_BASE}/containers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(container)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create container: ${errorText || response.statusText}`)
    }
    
    return response.json()
  }

  static async update(name: string, container: Partial<Container>): Promise<Container> {
    const response = await fetch(`${API_BASE}/containers/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(container)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update container: ${errorText || response.statusText}`)
    }
    
    return response.json()
  }

  static async delete(name: string): Promise<void> {
    const response = await fetch(`${API_BASE}/containers/${encodeURIComponent(name)}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete container: ${errorText || response.statusText}`)
    }
  }
}
