import { getWithAuth, postWithAuth, putWithAuth, deleteWithAuth } from './fetch-with-auth'

export type LotProperty = { name: string; value: string }
export type Lot = {
  name: string
  properties: LotProperty[]
}

export type LotLocation = {
  containerName: string
  quantity: number
  inputTimestamp: string
}

export type LotDetails = {
  name: string
  properties: LotProperty[]
  locations: LotLocation[]
}

export type LotCreateDto = {
  name: string
  containerName: string
  quantity: number
  properties?: LotProperty[]
}

export type LotUpdateDto = {
  name: string
  properties?: LotProperty[]
}

const base = '/api/lots'

export const LotService = {
  async getAll(): Promise<Lot[]> {
    const res = await getWithAuth(base)
    if (!res.ok) throw new Error('Failed to load lots')
    return (await res.json()) as Lot[]
  },
  async getOne(idOrName: string): Promise<Lot> {
    const res = await getWithAuth(`${base}/${encodeURIComponent(idOrName)}`)
    if (!res.ok) throw new Error('Failed to load lot')
    return (await res.json()) as Lot
  },
  async getDetails(idOrName: string): Promise<LotDetails> {
    const res = await getWithAuth(`${base}/${encodeURIComponent(idOrName)}/details`)
    if (!res.ok) throw new Error('Failed to load lot details')
    return (await res.json()) as LotDetails
  },
  async create(dto: LotCreateDto): Promise<Lot> {
    const res = await postWithAuth(base, dto)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to create lot')
    }
    return (await res.json()) as Lot
  },
  async update(idOrName: string, dto: LotUpdateDto): Promise<Lot> {
    const res = await putWithAuth(`${base}/${encodeURIComponent(idOrName)}`, dto)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to update lot')
    }
    return (await res.json()) as Lot
  },
  async remove(idOrName: string): Promise<void> {
    const res = await deleteWithAuth(`${base}/${encodeURIComponent(idOrName)}`)
    if (!res.ok) throw new Error('Failed to delete lot')
  },
}
