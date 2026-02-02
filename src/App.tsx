import { useState } from 'react'
import CreateProject from './components/CreateProject'
import ImportProject from './components/ImportProject'
import ApiList from './components/ApiList'
import ApiSidebar from './components/ApiSidebar'
import type { OpenAPIProject, OpenAPISpec, APIOperation, SecurityScheme, QueryParameter } from './types/openapi'
import './App.css'

function App() {
  const [projects, setProjects] = useState<OpenAPIProject[]>([])
  const [currentProject, setCurrentProject] = useState<OpenAPIProject | null>(null)
  const [sidebarMode, setSidebarMode] = useState<'create' | 'edit' | null>(null)
  const [editingApi, setEditingApi] = useState<{ path: string; method: string } | null>(null)

  // Helper function per estrarre l'autenticazione da un'API
  const extractAuthFromApi = (project: OpenAPIProject, path: string, method: string): string => {
    const apiOperation = project.spec.paths[path]?.[method]
    if (apiOperation?.security && Array.isArray(apiOperation.security) && apiOperation.security.length > 0) {
      const authSchemes = Object.keys(apiOperation.security[0])
      return authSchemes[0] || 'none'
    }
    return 'none'
  }

  // Helper function per estrarre i parametri da un'API
  const extractParametersFromApi = (project: OpenAPIProject, path: string, method: string): QueryParameter[] => {
    const apiOperation = project.spec.paths[path]?.[method]
    return apiOperation?.parameters || []
  }

  // Helper function per estrarre il body da un'API
  const extractRequestBodyFromApi = (project: OpenAPIProject, path: string, method: string): QueryParameter | null => {
    const apiOperation = project.spec.paths[path]?.[method]
    return apiOperation?.requestBody || null
  }

  const handleCreateProject = (name: string, spec: OpenAPISpec) => {
    const newProject: OpenAPIProject = {
      name,
      version: spec.info.version,
      spec,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    setProjects([...projects, newProject])
    setCurrentProject(newProject)
  }

  const handleImportProject = (name: string, spec: OpenAPISpec) => {
    const newProject: OpenAPIProject = {
      name,
      version: spec.info.version,
      spec,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    setProjects([...projects, newProject])
    setCurrentProject(newProject)
  }

  const handleSaveProject = () => {
    if (!currentProject) return

    const jsonContent = JSON.stringify(currentProject.spec, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = `${currentProject.name.replace(/\s+/g, '-').toLowerCase()}-openapi.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleAddApi = (path: string, method: string, auth: string, parameters: QueryParameter[], requestBody?: QueryParameter | null) => {
    if (!currentProject) return

    const apiOperation: APIOperation = {
      summary: `${method.toUpperCase()} ${path}`,
      parameters: parameters.length > 0 ? parameters : undefined,
      requestBody: requestBody || undefined,
      responses: {
        '200': {
          description: 'Successful response',
        },
      },
    }

    // Aggiungi l'autenticazione all'operazione se necessario
    if (auth !== 'none') {
      apiOperation.security = [{ [auth]: [] }]
    }

    const updatedSpec: OpenAPISpec = {
      ...currentProject.spec,
      paths: {
        ...currentProject.spec.paths,
        [path]: {
          ...(currentProject.spec.paths[path] || {}),
          [method]: apiOperation,
        },
      },
    }

    // Aggiungi lo schema di sicurezza se non è 'none'
    if (auth !== 'none') {
      if (!updatedSpec.components) {
        updatedSpec.components = {}
      }
      if (!updatedSpec.components.securitySchemes) {
        updatedSpec.components.securitySchemes = {}
      }

      // Aggiungi lo schema di sicurezza appropriato
      if (auth === 'api-key' && !updatedSpec.components.securitySchemes['api-key']) {
        const apiKeyScheme: SecurityScheme = {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        }
        updatedSpec.components.securitySchemes['api-key'] = apiKeyScheme
      } else if (auth === 'bearer' && !updatedSpec.components.securitySchemes['bearer']) {
        const bearerScheme: SecurityScheme = {
          type: 'http',
          scheme: 'bearer',
        }
        updatedSpec.components.securitySchemes['bearer'] = bearerScheme
      } else if (auth === 'basic' && !updatedSpec.components.securitySchemes['basic']) {
        const basicScheme: SecurityScheme = {
          type: 'http',
          scheme: 'basic',
        }
        updatedSpec.components.securitySchemes['basic'] = basicScheme
      } else if (auth === 'oauth2' && !updatedSpec.components.securitySchemes['oauth2']) {
        const oauth2Scheme: SecurityScheme = {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://example.com/oauth/authorize',
              tokenUrl: 'https://example.com/oauth/token',
              scopes: {
                'read:api': 'Read access',
                'write:api': 'Write access',
              },
            },
          },
        }
        updatedSpec.components.securitySchemes['oauth2'] = oauth2Scheme
      }
    }

    const updatedProject = {
      ...currentProject,
      spec: updatedSpec,
      updatedAt: new Date(),
    }

    setCurrentProject(updatedProject)
    
    // Aggiorna anche l'array dei progetti
    setProjects(projects.map(p => 
      p.name === currentProject.name ? updatedProject : p
    ))
    
    setSidebarMode(null)
  }

  const handleEditApi = (oldPath: string, oldMethod: string, newPath: string, newMethod: string, auth: string, parameters: QueryParameter[], requestBody?: QueryParameter | null) => {
    if (!currentProject) return

    const newPaths = { ...currentProject.spec.paths }
    
    // Salva i dati dell'API
    const apiData = newPaths[oldPath][oldMethod]
    
    // Rimuovi la vecchia API
    delete newPaths[oldPath][oldMethod]
    
    // Se il path non ha più metodi, rimuovi il path
    if (Object.keys(newPaths[oldPath]).length === 0) {
      delete newPaths[oldPath]
    }
    
    // Aggiungi la nuova API con autenticazione, parametri e body aggiornati
    if (!newPaths[newPath]) {
      newPaths[newPath] = {}
    }
    
    const updatedApiData: APIOperation = {
      ...apiData,
      summary: `${newMethod.toUpperCase()} ${newPath}`,
      parameters: parameters.length > 0 ? parameters : undefined,
      requestBody: requestBody || undefined,
    }

    // Aggiorna l'autenticazione
    if (auth !== 'none') {
      updatedApiData.security = [{ [auth]: [] }]
    } else {
      delete updatedApiData.security
    }

    newPaths[newPath][newMethod] = updatedApiData

    const updatedSpec: OpenAPISpec = {
      ...currentProject.spec,
      paths: newPaths,
    }

    // Aggiungi lo schema di sicurezza se necessario
    if (auth !== 'none') {
      if (!updatedSpec.components) {
        updatedSpec.components = {}
      }
      if (!updatedSpec.components.securitySchemes) {
        updatedSpec.components.securitySchemes = {}
      }

      if (auth === 'api-key' && !updatedSpec.components.securitySchemes['api-key']) {
        const apiKeyScheme: SecurityScheme = {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        }
        updatedSpec.components.securitySchemes['api-key'] = apiKeyScheme
      } else if (auth === 'bearer' && !updatedSpec.components.securitySchemes['bearer']) {
        const bearerScheme: SecurityScheme = {
          type: 'http',
          scheme: 'bearer',
        }
        updatedSpec.components.securitySchemes['bearer'] = bearerScheme
      } else if (auth === 'basic' && !updatedSpec.components.securitySchemes['basic']) {
        const basicScheme: SecurityScheme = {
          type: 'http',
          scheme: 'basic',
        }
        updatedSpec.components.securitySchemes['basic'] = basicScheme
      } else if (auth === 'oauth2' && !updatedSpec.components.securitySchemes['oauth2']) {
        const oauth2Scheme: SecurityScheme = {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://example.com/oauth/authorize',
              tokenUrl: 'https://example.com/oauth/token',
              scopes: {
                'read:api': 'Read access',
                'write:api': 'Write access',
              },
            },
          },
        }
        updatedSpec.components.securitySchemes['oauth2'] = oauth2Scheme
      }
    }

    const updatedProject = {
      ...currentProject,
      spec: updatedSpec,
      updatedAt: new Date(),
    }

    setCurrentProject(updatedProject)
    setProjects(projects.map(p => 
      p.name === currentProject.name ? updatedProject : p
    ))
    setEditingApi(null)
    setSidebarMode(null)
  }

  const handleDeleteApi = (path: string, method: string) => {
    if (!currentProject) return

    const newPaths = { ...currentProject.spec.paths }
    
    delete newPaths[path][method]
    
    if (Object.keys(newPaths[path]).length === 0) {
      delete newPaths[path]
    }

    const updatedSpec = {
      ...currentProject.spec,
      paths: newPaths,
    }

    const updatedProject = {
      ...currentProject,
      spec: updatedSpec,
      updatedAt: new Date(),
    }

    setCurrentProject(updatedProject)
    setProjects(projects.map(p => 
      p.name === currentProject.name ? updatedProject : p
    ))
    setEditingApi(null)
    setSidebarMode(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>OpenAPI Editor</h1>
      </header>
      
      <main className="app-main">
        {!currentProject ? (
          <div className="landing-page">
            <CreateProject onCreateProject={handleCreateProject} />
            <ImportProject onImportProject={handleImportProject} />
          </div>
        ) : (
          <div className="project-container">
            <div className="project-view">
              <h2>Progetto: {currentProject.name}</h2>
              
              <button 
                onClick={() => {
                  setSidebarMode('create');
                  setEditingApi(null);
                }} 
                className="btn-add-api"
              >
                + Nuova API
              </button>
              
              <ApiList 
                paths={currentProject.spec.paths} 
                onApiClick={(path, method) => {
                  setEditingApi({ path, method });
                  setSidebarMode('edit');
                }}
              />
              
              <div className="spec-preview">
                <h3>Specifica OpenAPI</h3>
                <pre>{JSON.stringify(currentProject.spec, null, 2)}</pre>
              </div>
              
              <div className="project-actions">
                <button onClick={handleSaveProject} className="btn-save">
                  Salva
                </button>
                <button onClick={() => setCurrentProject(null)}>
                  Nuovo Progetto
                </button>
              </div>
            </div>
            
            {sidebarMode && (
              <ApiSidebar
                mode={sidebarMode}
                initialPath={editingApi?.path || ''}
                initialMethod={editingApi?.method || 'GET'}
                initialAuth={editingApi ? extractAuthFromApi(currentProject!, editingApi.path, editingApi.method) : 'none'}
                initialParameters={editingApi ? extractParametersFromApi(currentProject!, editingApi.path, editingApi.method) : []}
                initialRequestBody={editingApi ? extractRequestBodyFromApi(currentProject!, editingApi.path, editingApi.method) : null}
                onSave={handleAddApi}
                onUpdate={handleEditApi}
                onDelete={handleDeleteApi}
                onClose={() => {
                  setSidebarMode(null);
                  setEditingApi(null);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
