import { useState } from 'react';
import type { OpenAPISpec } from '../types/openapi';
import './CreateProject.css';

interface CreateProjectProps {
  onCreateProject: (name: string, spec: OpenAPISpec) => void;
}

export default function CreateProject({ onCreateProject }: CreateProjectProps) {
  const [projectName, setProjectName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      alert('Inserisci un nome per il progetto');
      return;
    }

    const newSpec: OpenAPISpec = {
      openapi: '3.0.0',
      info: {
        title: projectName,
        version: version,
        description: description || undefined,
      },
      paths: {},
    };

    onCreateProject(projectName, newSpec);
    
    // Reset form
    setProjectName('');
    setVersion('1.0.0');
    setDescription('');
  };

  return (
    <div className="create-project">
      <h2>Crea Nuovo Progetto OpenAPI</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Nome Progetto *</label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="es. My API"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="version">Versione</label>
          <input
            id="version"
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descrizione</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrizione del progetto..."
            rows={3}
          />
        </div>

        <button type="submit" className="btn-primary">
          Crea Progetto
        </button>
      </form>
    </div>
  );
}
