import type { MoveMaterialsRequest, UpdateLotQuantityRequest, Transfer } from '@/models/action'
import { postWithAuth } from './fetch-with-auth'
import { useToast } from './toast'

const { show } = useToast()
const toast = {
  success: (msg: string) => show(msg, 'success'),
  error: (msg: string) => show(msg, 'error'),
}

const API_BASE = '/api/actions'

export const ActionService = {
  async moveMaterials(request: MoveMaterialsRequest): Promise<Transfer> {
    try {
      const response = await postWithAuth(`${API_BASE}/move-materials`, request)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.title || 'Failed to move materials'
        throw new Error(errorMessage)
      }

      const data = await response.json()
      toast.success('Materials moved successfully!')
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to move materials'
      toast.error(errorMessage)
      throw error
    }
  },

  async updateLotQuantity(request: UpdateLotQuantityRequest): Promise<void> {
    try {
      const response = await postWithAuth(`${API_BASE}/update-lot-quantity`, request)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.title || 'Failed to update lot quantity'
        throw new Error(errorMessage)
      }

      toast.success('Lot quantity updated successfully!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update lot quantity'
      toast.error(errorMessage)
      throw error
    }
  },
}
