import { useState, useEffect } from 'react';
import './ApiSidebar.css';

interface ApiSidebarProps {
  mode: 'create' | 'edit';
  initialPath?: string;
  initialMethod?: string;
  onSave: (path: string, method: string) => void;
  onUpdate?: (oldPath: string, oldMethod: string, newPath: string, newMethod: string) => void;
  onDelete?: (path: string, method: string) => void;
  onClose: () => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export default function ApiSidebar({ 
  mode,
  initialPath = '', 
  initialMethod = 'GET', 
  onSave,
  onUpdate,
  onDelete,
  onClose 
}: ApiSidebarProps) {
  const [path, setPath] = useState(initialPath);
  const [method, setMethod] = useState(initialMethod.toUpperCase());

  useEffect(() => {
    setPath(initialPath);
    setMethod(initialMethod.toUpperCase());
  }, [initialPath, initialMethod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!path.trim()) {
      alert('Inserisci un path per l\'API');
      return;
    }

    if (!path.startsWith('/')) {
      alert('Il path deve iniziare con /');
      return;
    }

    if (mode === 'create') {
      onSave(path, method.toLowerCase());
      setPath('');
      setMethod('GET');
    } else if (mode === 'edit' && onUpdate) {
      onUpdate(initialPath, initialMethod, path, method.toLowerCase());
    }
  };

  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare questa API?')) {
      if (onDelete) {
        onDelete(initialPath, initialMethod);
      }
    }
  };

  return (
    <div className="api-sidebar">
      <div className="sidebar-header">
        <h3>{mode === 'create' ? 'Nuova API' : 'Modifica API'}</h3>
        <button className="sidebar-close" onClick={onClose}>×</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="sidebar-form-group">
          <label htmlFor="api-method">Metodo HTTP</label>
          <select
            id="api-method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="sidebar-form-group">
          <label htmlFor="api-path">Path</label>
          <input
            id="api-path"
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/users"
            required
          />
        </div>

        <div className="sidebar-actions">
          {mode === 'edit' && onDelete && (
            <button type="button" onClick={handleDelete} className="btn-delete">
              Elimina
            </button>
          )}
          <button type="submit" className="btn-primary">
            {mode === 'create' ? 'Aggiungi' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  );
}
