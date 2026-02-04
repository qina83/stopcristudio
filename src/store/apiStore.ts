import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import * as YAML from 'js-yaml'
import { ApiSpec, ApiStoreState, Endpoint, Model, SecurityScheme, Schema } from '../types/api'

// Default empty spec
const defaultSpec: ApiSpec = {
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API created with StopCriStudio',
  },
  servers: [
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  paths: {},
  models: {},
  securitySchemes: {},
}

/**
 * Zustand store for API specification management
 */
export const useApiStore = create<ApiStoreState>()(
  devtools(
    (set, get) => ({
      spec: defaultSpec,
      selectedEndpointId: null,
      selectedModelId: null,
      hasUnsavedChanges: false,

      // ===== Spec Management =====
      setSpec: (spec: ApiSpec) =>
        set(
          {
            spec,
            hasUnsavedChanges: true,
          },
          false,
          'setSpec'
        ),

      resetSpec: () =>
        set(
          {
            spec: structuredClone(defaultSpec),
            selectedEndpointId: null,
            selectedModelId: null,
            hasUnsavedChanges: false,
          },
          false,
          'resetSpec'
        ),

      exportSpec: (format: 'json' | 'yaml'): string => {
        const spec = get().spec
        if (format === 'json') {
          return JSON.stringify(spec, null, 2)
        } else {
          return YAML.dump(spec, { indent: 2 }) as string
        }
      },

      // ===== Endpoint Operations =====
      addEndpoint: (path: string, method: Endpoint['method']) =>
        set((state) => {
          const newEndpoint: Endpoint = {
            id: `${method.toLowerCase()}-${path}-${Date.now()}`,
            path,
            method,
            summary: '',
            description: '',
            parameters: [],
            responses: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          const updatedSpec = structuredClone(state.spec)
          if (!updatedSpec.paths[path]) {
            updatedSpec.paths[path] = []
          }
          updatedSpec.paths[path].push(newEndpoint)

          return {
            spec: updatedSpec,
            hasUnsavedChanges: true,
          }
        }, false, 'addEndpoint'),

      updateEndpoint: (id: string, updates: Partial<Endpoint>) =>
        set((state) => {
          const updatedSpec = structuredClone(state.spec)
          let found = false

          for (const path in updatedSpec.paths) {
            const endpoint = updatedSpec.paths[path].find((e) => e.id === id)
            if (endpoint) {
              Object.assign(endpoint, updates, { updatedAt: new Date() })
              found = true
              break
            }
          }

          return {
            spec: found ? updatedSpec : state.spec,
            hasUnsavedChanges: found,
          }
        }, false, 'updateEndpoint'),

      deleteEndpoint: (id: string) =>
        set((state) => {
          const updatedSpec = structuredClone(state.spec)
          let found = false

          for (const path in updatedSpec.paths) {
            const index = updatedSpec.paths[path].findIndex((e) => e.id === id)
            if (index > -1) {
              updatedSpec.paths[path].splice(index, 1)
              if (updatedSpec.paths[path].length === 0) {
                delete updatedSpec.paths[path]
              }
              found = true
              break
            }
          }

          return {
            spec: found ? updatedSpec : state.spec,
            selectedEndpointId: state.selectedEndpointId === id ? null : state.selectedEndpointId,
            hasUnsavedChanges: found,
          }
        }, false, 'deleteEndpoint'),

      selectEndpoint: (id: string | null) =>
        set({ selectedEndpointId: id }, false, 'selectEndpoint'),

      // ===== Model Operations =====
      addModel: (name: string, schema: Schema) =>
        set((state) => {
          const newModel: Model = {
            id: `model-${name}-${Date.now()}`,
            name,
            schema,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          const updatedSpec = structuredClone(state.spec)
          updatedSpec.models[name] = newModel

          return {
            spec: updatedSpec,
            hasUnsavedChanges: true,
          }
        }, false, 'addModel'),

      updateModel: (id: string, schema: Schema) =>
        set((state) => {
          const updatedSpec = structuredClone(state.spec)
          let found = false

          for (const name in updatedSpec.models) {
            if (updatedSpec.models[name].id === id) {
              updatedSpec.models[name].schema = schema
              updatedSpec.models[name].updatedAt = new Date()
              found = true
              break
            }
          }

          return {
            spec: found ? updatedSpec : state.spec,
            hasUnsavedChanges: found,
          }
        }, false, 'updateModel'),

      deleteModel: (id: string) =>
        set((state) => {
          const updatedSpec = structuredClone(state.spec)
          let found = false

          for (const name in updatedSpec.models) {
            if (updatedSpec.models[name].id === id) {
              delete updatedSpec.models[name]
              found = true
              break
            }
          }

          return {
            spec: found ? updatedSpec : state.spec,
            selectedModelId: state.selectedModelId === id ? null : state.selectedModelId,
            hasUnsavedChanges: found,
          }
        }, false, 'deleteModel'),

      selectModel: (id: string | null) =>
        set({ selectedModelId: id }, false, 'selectModel'),

      // ===== Security Scheme Operations =====
      addSecurityScheme: (scheme: SecurityScheme) =>
        set((state) => {
          const updatedSpec = structuredClone(state.spec)
          updatedSpec.securitySchemes[scheme.name] = scheme

          return {
            spec: updatedSpec,
            hasUnsavedChanges: true,
          }
        }, false, 'addSecurityScheme'),

      updateSecurityScheme: (id: string, updates: Partial<SecurityScheme>) =>
        set((state) => {
          const updatedSpec = structuredClone(state.spec)
          let found = false

          for (const name in updatedSpec.securitySchemes) {
            if (updatedSpec.securitySchemes[name].id === id) {
              Object.assign(updatedSpec.securitySchemes[name], updates)
              found = true
              break
            }
          }

          return {
            spec: found ? updatedSpec : state.spec,
            hasUnsavedChanges: found,
          }
        }, false, 'updateSecurityScheme'),

      deleteSecurityScheme: (id: string) =>
        set((state) => {
          const updatedSpec = structuredClone(state.spec)
          let found = false

          for (const name in updatedSpec.securitySchemes) {
            if (updatedSpec.securitySchemes[name].id === id) {
              delete updatedSpec.securitySchemes[name]
              found = true
              break
            }
          }

          return {
            spec: found ? updatedSpec : state.spec,
            hasUnsavedChanges: found,
          }
        }, false, 'deleteSecurityScheme'),

      // ===== Unsaved Changes Tracking =====
      markUnsavedChanges: () =>
        set({ hasUnsavedChanges: true }, false, 'markUnsavedChanges'),

      markSavedChanges: () =>
        set({ hasUnsavedChanges: false }, false, 'markSavedChanges'),
    }),
    {
      name: 'api-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)
