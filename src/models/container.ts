interface Response {
  items: Container[]
}

interface Property {
  name: string
  value: string
}

interface Container {
  name: string
  properties: Property[]
}

export type { Response, Container, Property }
