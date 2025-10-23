export enum PropertyType {
  String = 'String',
  Double = 'Double',
  Integer = 'Integer',
  Boolean = 'Boolean',
  DateTime = 'DateTime',
  Array = 'Array'
}

interface PropertyDefinition {
  name: string
  description?: string
  type: number
}

export type { PropertyDefinition }