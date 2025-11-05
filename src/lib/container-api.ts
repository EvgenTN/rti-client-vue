const API_BASE = '/api'

export interface Container {
  name: string
  properties?: Array<{ name: string; value: string }>
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
}
