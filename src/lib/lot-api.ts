export type LotProperty = { name: string; value: string }
export type Lot = {
  name: string
  properties: LotProperty[]
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
    const res = await fetch(base)
    if (!res.ok) throw new Error('Failed to load lots')
    return (await res.json()) as Lot[]
  },
  async getOne(idOrName: string): Promise<Lot> {
    const res = await fetch(`${base}/${encodeURIComponent(idOrName)}`)
    if (!res.ok) throw new Error('Failed to load lot')
    return (await res.json()) as Lot
  },
  async create(dto: LotCreateDto): Promise<Lot> {
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to create lot')
    }
    return (await res.json()) as Lot
  },
  async update(idOrName: string, dto: LotUpdateDto): Promise<Lot> {
    const res = await fetch(`${base}/${encodeURIComponent(idOrName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to update lot')
    }
    return (await res.json()) as Lot
  },
  async remove(idOrName: string): Promise<void> {
    const res = await fetch(`${base}/${encodeURIComponent(idOrName)}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete lot')
  },
}
