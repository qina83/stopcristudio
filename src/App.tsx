import { useState } from 'react'
import CreateProject from './components/CreateProject'
import ImportProject from './components/ImportProject'
import ApiList from './components/ApiList'
import ApiSidebar from './components/ApiSidebar'
import type { OpenAPIProject, OpenAPISpec } from './types/openapi'
import './App.css'

function App() {
  const [projects, setProjects] = useState<OpenAPIProject[]>([])
  const [currentProject, setCurrentProject] = useState<OpenAPIProject | null>(null)
  const [sidebarMode, setSidebarMode] = useState<'create' | 'edit' | null>(null)
  const [editingApi, setEditingApi] = useState<{ path: string; method: string } | null>(null)

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

  const handleAddApi = (path: string, method: string) => {
    if (!currentProject) return

    const updatedSpec = {
      ...currentProject.spec,
      paths: {
        ...currentProject.spec.paths,
        [path]: {
          ...(currentProject.spec.paths[path] || {}),
          [method]: {
            summary: `${method.toUpperCase()} ${path}`,
            responses: {
              '200': {
                description: 'Successful response',
              },
            },
          },
        },
      },
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

  const handleEditApi = (oldPath: string, oldMethod: string, newPath: string, newMethod: string) => {
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
    
    // Aggiungi la nuova API
    if (!newPaths[newPath]) {
      newPaths[newPath] = {}
    }
    
    newPaths[newPath][newMethod] = {
      ...apiData,
      summary: `${newMethod.toUpperCase()} ${newPath}`,
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
