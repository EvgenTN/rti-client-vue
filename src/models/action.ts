import type { Container } from './container'

export interface MoveMaterialsRequest {
  sourceContainerName: string
  destinationContainerName: string
  quantity: number
  startedAt?: string
  finishedAt?: string
}

export interface UpdateLotQuantityRequest {
  lotName: string
  containerName: string
  quantity: number
}

export interface TransferLot {
  quantity: number
  lot: {
    name: string
    properties: Array<{ name: string; value: string }>
  }
}

export interface Transfer {
  id: string
  sourceContainer: Container
  destinationContainer: Container
  startedAt: string
  finishedAt: string
  lots: TransferLot[]
}
