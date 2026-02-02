import { useState, useEffect } from 'react';
import './ApiEditModal.css';

interface ApiEditModalProps {
  initialPath: string;
  initialMethod: string;
  onSave: (oldPath: string, oldMethod: string, newPath: string, newMethod: string) => void;
  onDelete: (path: string, method: string) => void;
  onClose: () => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export default function ApiEditModal({ 
  initialPath, 
  initialMethod, 
  onSave, 
  onDelete,
  onClose 
}: ApiEditModalProps) {
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

    onSave(initialPath, initialMethod, path, method.toLowerCase());
  };

  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare questa API?')) {
      onDelete(initialPath, initialMethod);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modifica API</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-method">Metodo HTTP</label>
              <select
                id="edit-method"
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

            <div className="form-group form-group-path">
              <label htmlFor="edit-path">Path</label>
              <input
                id="edit-path"
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/users"
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleDelete} className="btn-delete">
              Elimina
            </button>
            <div className="modal-actions-right">
              <button type="button" onClick={onClose} className="btn-cancel">
                Annulla
              </button>
              <button type="submit" className="btn-save">
                Salva
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
