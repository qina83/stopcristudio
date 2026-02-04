/**
 * OpenAPI 3.0 Type Definitions for StopCriStudio
 */

// Basic schema types
export type PrimitiveType = 'string' | 'number' | 'integer' | 'boolean'
export type ComplexType = 'object' | 'array'
export type SchemaType = PrimitiveType | ComplexType

// Schema definition
export interface Schema {
  id: string // unique identifier
  name: string // user-friendly name
  type: SchemaType
  description?: string
  required?: boolean

  // For primitives
  default?: any
  format?: string // e.g., 'date-time', 'uuid', 'email'

  // For objects
  properties?: Record<string, Schema>
  requiredFields?: string[] // names of required properties

  // For arrays
  items?: Schema // the type of items in the array

  // For references
  $ref?: string // reference to another schema (e.g., '#/components/schemas/User')
}

// Model (reusable schema)
export interface Model {
  id: string
  name: string
  schema: Schema
  createdAt: Date
  updatedAt: Date
}

// Parameter (query or path)
export interface Parameter {
  id: string
  name: string
  in: 'query' | 'path'
  description?: string
  required: boolean
  schema: Schema
}

// Request body
export interface RequestBody {
  description?: string
  required: boolean
  contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'application/xml'
  schema: Schema
}

// Response
export interface Response {
  id: string
  statusCode: number // 200, 201, 400, 401, 404, 500, etc.
  description: string
  contentType: 'application/json' | 'application/xml' | 'text/plain'
  schema?: Schema
}

// Security scheme
export interface SecurityScheme {
  id: string
  name: string
  type: 'http' | 'apiKey' | 'oauth2' | 'openId'
  scheme?: string // e.g., 'bearer'
  bearerFormat?: string // e.g., 'JWT'
}

// Endpoint
export interface Endpoint {
  id: string
  path: string // e.g., '/users/{userId}'
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  summary: string
  description?: string
  security?: SecurityScheme[] // security schemes required for this endpoint
  parameters: Parameter[]
  requestBody?: RequestBody
  responses: Response[]
  createdAt: Date
  updatedAt: Date
}

// API Specification
export interface ApiSpec {
  info: {
    title: string
    version: string
    description?: string
  }
  servers?: Array<{
    url: string
    description?: string
  }>
  paths: Record<string, Endpoint[]> // grouped by path
  models: Record<string, Model> // reusable models by name
  securitySchemes: Record<string, SecurityScheme> // available security schemes
}

// Store state
export interface ApiStoreState {
  spec: ApiSpec
  selectedEndpointId: string | null
  selectedModelId: string | null
  hasUnsavedChanges: boolean

  // Spec management
  setSpec: (spec: ApiSpec) => void
  resetSpec: () => void
  exportSpec: (format: 'json' | 'yaml') => string

  // Endpoint operations
  addEndpoint: (path: string, method: Endpoint['method']) => void
  updateEndpoint: (id: string, endpoint: Partial<Endpoint>) => void
  deleteEndpoint: (id: string) => void
  selectEndpoint: (id: string | null) => void

  // Model operations
  addModel: (name: string, schema: Schema) => void
  updateModel: (id: string, schema: Schema) => void
  deleteModel: (id: string) => void
  selectModel: (id: string | null) => void

  // Security scheme operations
  addSecurityScheme: (scheme: SecurityScheme) => void
  updateSecurityScheme: (id: string, scheme: Partial<SecurityScheme>) => void
  deleteSecurityScheme: (id: string) => void

  // Unsaved changes tracking
  markUnsavedChanges: () => void
  markSavedChanges: () => void
}
