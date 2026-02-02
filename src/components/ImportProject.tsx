import { useRef } from 'react';
import type { OpenAPISpec } from '../types/openapi';
import './ImportProject.css';

interface ImportProjectProps {
  onImportProject: (name: string, spec: OpenAPISpec) => void;
}

export default function ImportProject({ onImportProject }: ImportProjectProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const spec = JSON.parse(content) as OpenAPISpec;

        // Validazione base
        if (!spec.openapi || !spec.info || !spec.info.title) {
          alert('File OpenAPI non valido. Verifica che contenga i campi obbligatori.');
          return;
        }

        // Usa il titolo dalla spec o il nome del file
        const projectName = spec.info.title || file.name.replace('.json', '');
        
        onImportProject(projectName, spec);
        
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        alert('Errore nel caricamento del file. Verifica che sia un file JSON valido.');
        console.error(error);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="import-project">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.yaml,.yml"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="btn-import"
      >
        📁 Importa Progetto
      </button>
    </div>
  );
}
